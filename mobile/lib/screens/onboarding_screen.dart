import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/user_provider.dart';
import '../providers/internship_provider.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _formKey   = GlobalKey<FormState>();
  final _nameCtrl  = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl  = TextEditingController();
  final _phoneCtrl = TextEditingController();

  List<AppUser> _mentors        = [];
  String?       _selectedMentor;
  String?       _selectedInternship;
  bool          _loading        = false;
  bool          _obscure        = true;
  bool          _submitted      = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final mentors = await context.read<UserProvider>().fetchMentors();
    if (!mounted) return;
    setState(() => _mentors = mentors);
    await context.read<InternshipProvider>().fetchInternships(status: 'active');
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _submitted = true);
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);
    final body = {
      'name':     _nameCtrl.text.trim(),
      'email':    _emailCtrl.text.trim(),
      'password': _passCtrl.text.trim(),
      if (_phoneCtrl.text.isNotEmpty) 'phone': _phoneCtrl.text.trim(),
      if (_selectedMentor != null)     'mentorId': _selectedMentor,
      if (_selectedInternship != null) 'internshipId': _selectedInternship,
    };

    final ok = await context.read<UserProvider>().onboardStudent(body);
    if (!mounted) return;
    setState(() => _loading = false);

    if (ok) {
      _formKey.currentState!.reset();
      _nameCtrl.clear(); _emailCtrl.clear(); _passCtrl.clear(); _phoneCtrl.clear();
      setState(() {
        _selectedMentor      = null;
        _selectedInternship  = null;
        _submitted           = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(children: [
            Icon(Icons.check_circle_rounded, color: Colors.white),
            SizedBox(width: 10),
            Expanded(
              child: Text('Student onboarded successfully!'),
            ),
          ]),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    } else {
      final err = context.read<UserProvider>().error ?? 'Failed to onboard student';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(err),
          backgroundColor: Theme.of(context).colorScheme.error,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }

  InputDecoration _dec(String label, IconData icon, {String? hint}) =>
      InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(icon),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: Theme.of(context).colorScheme.outline.withOpacity(0.3),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: Theme.of(context).colorScheme.primary, width: 2,
          ),
        ),
        filled: true,
        fillColor: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.3),
      );

  @override
  Widget build(BuildContext context) {
    final ip    = context.watch<InternshipProvider>();
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Onboard Student')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          autovalidateMode: _submitted
              ? AutovalidateMode.always
              : AutovalidateMode.disabled,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      theme.colorScheme.primary.withOpacity(0.12),
                      theme.colorScheme.primary.withOpacity(0.04),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: theme.colorScheme.primary.withOpacity(0.15),
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 48, height: 48,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primary.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(Icons.person_add_rounded,
                          color: theme.colorScheme.primary, size: 26),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Add New Intern',
                              style: theme.textTheme.titleMedium
                                  ?.copyWith(fontWeight: FontWeight.bold)),
                          Text(
                            'Create student account and assign mentor + internship',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurface.withOpacity(0.55),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),
              _sectionLabel('Account Details', theme),
              const SizedBox(height: 12),

              // Name
              TextFormField(
                controller: _nameCtrl,
                textCapitalization: TextCapitalization.words,
                decoration: _dec('Full Name', Icons.badge_rounded),
                validator: (v) => (v == null || v.trim().length < 2)
                    ? 'Enter at least 2 characters' : null,
              ),
              const SizedBox(height: 14),

              // Email
              TextFormField(
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                decoration: _dec('Email Address', Icons.email_rounded),
                validator: (v) => (v == null || !v.contains('@'))
                    ? 'Enter a valid email' : null,
              ),
              const SizedBox(height: 14),

              // Password
              TextFormField(
                controller: _passCtrl,
                obscureText: _obscure,
                decoration: _dec('Password', Icons.lock_rounded).copyWith(
                  suffixIcon: IconButton(
                    icon: Icon(_obscure
                        ? Icons.visibility_off_rounded
                        : Icons.visibility_rounded),
                    onPressed: () => setState(() => _obscure = !_obscure),
                  ),
                ),
                validator: (v) => (v == null || v.length < 6)
                    ? 'Minimum 6 characters' : null,
              ),
              const SizedBox(height: 14),

              // Phone (optional)
              TextFormField(
                controller: _phoneCtrl,
                keyboardType: TextInputType.phone,
                decoration: _dec('Phone Number', Icons.phone_rounded,
                    hint: 'Optional'),
              ),

              const SizedBox(height: 28),
              _sectionLabel('Assign to Programme', theme),
              const SizedBox(height: 12),

              // Mentor dropdown
              DropdownButtonFormField<String>(
                isExpanded: true,
                value: _selectedMentor,
                decoration: _dec('Assign Mentor', Icons.supervisor_account_rounded,
                    hint: 'Select a mentor (optional)'),
                items: [
                  const DropdownMenuItem(value: null, child: Text('None')),
                  ..._mentors.map((m) => DropdownMenuItem(
                        value: m.id,
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 12,
                              backgroundColor:
                                  Colors.purple.withOpacity(0.15),
                              child: Text(m.initials,
                                  style: const TextStyle(
                                      fontSize: 10,
                                      color: Colors.purple,
                                      fontWeight: FontWeight.bold)),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                m.name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      )),
                ],
                onChanged: (v) => setState(() => _selectedMentor = v),
              ),
              const SizedBox(height: 14),

              // Internship dropdown
              DropdownButtonFormField<String>(
                isExpanded: true,
                value: _selectedInternship,
                decoration: _dec(
                    'Assign Internship', Icons.work_rounded,
                    hint: 'Select internship (optional)'),
                items: [
                  const DropdownMenuItem(value: null, child: Text('None')),
                  ...ip.internships.map((i) => DropdownMenuItem(
                        value: i.id,
                        child: Text(
                          i.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      )),
                ],
                onChanged: (v) => setState(() => _selectedInternship = v),
              ),

              const SizedBox(height: 32),

              // Submit
              SizedBox(
                width: double.infinity,
                height: 52,
                child: FilledButton.icon(
                  onPressed: _loading ? null : _submit,
                  icon: _loading
                      ? const SizedBox(
                          width: 18, height: 18,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.rocket_launch_rounded),
                  label: Text(_loading ? 'Onboarding…' : 'Onboard Student',
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.bold)),
                  style: FilledButton.styleFrom(
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sectionLabel(String text, ThemeData theme) => Row(
        children: [
          Container(
            width: 3, height: 18,
            decoration: BoxDecoration(
              color: theme.colorScheme.primary,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.titleSmall
                  ?.copyWith(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      );
}
