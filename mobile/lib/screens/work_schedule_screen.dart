import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/work_schedule_provider.dart';

class WorkScheduleScreen extends StatefulWidget {
  const WorkScheduleScreen({super.key});

  @override
  State<WorkScheduleScreen> createState() => _WorkScheduleScreenState();
}

class _WorkScheduleScreenState extends State<WorkScheduleScreen> {
  static const _allDays = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  ];

  // Edit state
  List<String> _days       = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
  String _startTime        = '09:00';
  String _endTime          = '18:00';
  int    _grace            = 15;
  bool   _requirePhoto     = true;
  bool   _editing          = false;
  bool   _saving           = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await context.read<WorkScheduleProvider>().fetchSchedule();
      _populateFromCurrent();
    });
  }

  void _populateFromCurrent() {
    final ws = context.read<WorkScheduleProvider>().current;
    if (ws == null) return;
    setState(() {
      _days         = List<String>.from(ws.workingDays);
      _startTime    = ws.startTime;
      _endTime      = ws.endTime;
      _grace        = ws.graceMinutes;
      _requirePhoto = ws.requirePhoto;
    });
  }

  Future<void> _pickTime(bool isStart) async {
    final parts = (isStart ? _startTime : _endTime).split(':');
    final initial = TimeOfDay(
      hour:   int.tryParse(parts[0]) ?? 9,
      minute: int.tryParse(parts[1]) ?? 0,
    );
    final picked = await showTimePicker(context: context, initialTime: initial);
    if (picked == null || !mounted) return;
    final str = '${picked.hour.toString().padLeft(2,'0')}:${picked.minute.toString().padLeft(2,'0')}';
    setState(() {
      if (isStart) _startTime = str;
      else         _endTime   = str;
    });
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    final ok = await context.read<WorkScheduleProvider>().saveSchedule({
      'workingDays':  _days,
      'startTime':    _startTime,
      'endTime':      _endTime,
      'graceMinutes': _grace,
      'requirePhoto': _requirePhoto,
    });
    if (!mounted) return;
    setState(() { _saving = false; _editing = false; });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(ok ? 'Schedule saved!' : 'Failed to save'),
        backgroundColor: ok ? Colors.green : Colors.red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final wsp   = context.watch<WorkScheduleProvider>();
    final theme = Theme.of(context);
    final ws    = wsp.current;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Work Schedule'),
        actions: [
          if (!_editing)
            IconButton(
              icon: const Icon(Icons.edit_rounded),
              onPressed: () => setState(() => _editing = true),
              tooltip: 'Edit',
            )
          else ...[
            TextButton(
              onPressed: () {
                _populateFromCurrent();
                setState(() => _editing = false);
              },
              child: const Text('Cancel'),
            ),
            FilledButton.tonal(
              onPressed: _saving ? null : _save,
              child: _saving
                  ? const SizedBox(
                      width: 16, height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2))
                  : const Text('Save'),
            ),
            const SizedBox(width: 8),
          ],
        ],
      ),
      body: wsp.loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async {
                await wsp.fetchSchedule();
                _populateFromCurrent();
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Current schedule summary (view mode header)
                    if (!_editing && ws != null) ...[
                      _viewCard(ws, theme),
                      const SizedBox(height: 20),
                    ],

                    // Working days
                    _sectionHeader('Working Days', Icons.calendar_view_week_rounded, theme),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _allDays.map((day) {
                        final selected = _days.contains(day);
                        final abbr = day.substring(0, 3);
                        return _editing
                            ? FilterChip(
                                label: Text(abbr),
                                selected: selected,
                                onSelected: (v) => setState(() {
                                  if (v) _days.add(day);
                                  else   _days.remove(day);
                                }),
                                showCheckmark: false,
                                selectedColor:
                                    theme.colorScheme.primary.withOpacity(0.15),
                                side: BorderSide(
                                  color: selected
                                      ? theme.colorScheme.primary
                                      : theme.colorScheme.outline.withOpacity(0.3),
                                ),
                              )
                            : Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: selected
                                      ? theme.colorScheme.primary.withOpacity(0.12)
                                      : theme.colorScheme.surfaceVariant.withOpacity(0.4),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: selected
                                        ? theme.colorScheme.primary.withOpacity(0.4)
                                        : Colors.transparent,
                                  ),
                                ),
                                child: Text(abbr,
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: selected
                                          ? FontWeight.bold : FontWeight.normal,
                                      color: selected
                                          ? theme.colorScheme.primary
                                          : theme.colorScheme.onSurface.withOpacity(0.5),
                                    )),
                              );
                      }).toList(),
                    ),

                    const SizedBox(height: 24),
                    _sectionHeader('Timings', Icons.schedule_rounded, theme),
                    const SizedBox(height: 12),

                    // Start / End time
                    Row(
                      children: [
                        Expanded(child: _timeCard('Start Time', _startTime,
                            Icons.login_rounded, Colors.green, () => _pickTime(true), theme)),
                        const SizedBox(width: 12),
                        Expanded(child: _timeCard('End Time', _endTime,
                            Icons.logout_rounded, Colors.red, () => _pickTime(false), theme)),
                      ],
                    ),

                    const SizedBox(height: 24),
                    _sectionHeader('Grace Period', Icons.timer_rounded, theme),
                    const SizedBox(height: 12),

                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surfaceVariant.withOpacity(0.4),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Allow late check-in up to',
                                  style: theme.textTheme.bodyMedium),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 4),
                                decoration: BoxDecoration(
                                  color: theme.colorScheme.primary.withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text('$_grace min',
                                    style: TextStyle(
                                      color: theme.colorScheme.primary,
                                      fontWeight: FontWeight.bold,
                                    )),
                              ),
                            ],
                          ),
                          if (_editing) ...[
                            const SizedBox(height: 8),
                            Slider(
                              value: _grace.toDouble(),
                              min: 0, max: 60, divisions: 12,
                              label: '$_grace min',
                              onChanged: (v) => setState(() => _grace = v.round()),
                            ),
                          ],
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),
                    _sectionHeader('Requirements', Icons.rule_rounded, theme),
                    const SizedBox(height: 8),

                    Card(
                      elevation: 0,
                      color: theme.colorScheme.surfaceVariant.withOpacity(0.4),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                      child: SwitchListTile(
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 4),
                        secondary: Container(
                          width: 40, height: 40,
                          decoration: BoxDecoration(
                            color: (_requirePhoto ? Colors.blue : Colors.grey)
                                .withOpacity(0.12),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(Icons.camera_alt_rounded,
                              color: _requirePhoto ? Colors.blue : Colors.grey,
                              size: 20),
                        ),
                        title: const Text('Require Selfie Photo'),
                        subtitle: Text(_requirePhoto
                            ? 'Students must capture a photo at check-in/out'
                            : 'Photo is optional for attendance',
                            style: theme.textTheme.bodySmall),
                        value: _requirePhoto,
                        onChanged: _editing
                            ? (v) => setState(() => _requirePhoto = v)
                            : null,
                      ),
                    ),

                    if (!_editing) ...[
                      const SizedBox(height: 28),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () => setState(() => _editing = true),
                              icon: const Icon(Icons.edit_rounded),
                              label: const Text('Edit Schedule'),
                            ),
                          ),
                        ],
                      ),
                    ],
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _viewCard(WorkSchedule ws, ThemeData theme) => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: [
            theme.colorScheme.primary.withOpacity(0.12),
            theme.colorScheme.primary.withOpacity(0.04),
          ]),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: theme.colorScheme.primary.withOpacity(0.15),
          ),
        ),
        child: Column(
          children: [
            Row(
              children: [
                Icon(Icons.schedule_rounded, color: theme.colorScheme.primary),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    ws.isDefault ? 'Default Schedule' : ws.name,
                    style: theme.textTheme.titleSmall
                        ?.copyWith(fontWeight: FontWeight.bold),
                  ),
                ),
                if (ws.isDefault)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.orange.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text('Default',
                        style: TextStyle(
                            fontSize: 11,
                            color: Colors.orange,
                            fontWeight: FontWeight.bold)),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _pillInfo(Icons.login_rounded, ws.startTime, Colors.green, theme),
                const SizedBox(width: 8),
                const Icon(Icons.arrow_forward_rounded, size: 14),
                const SizedBox(width: 8),
                _pillInfo(Icons.logout_rounded, ws.endTime, Colors.red, theme),
                const Spacer(),
                _pillInfo(Icons.timer_rounded,
                    '${ws.graceMinutes}m grace', Colors.orange, theme),
              ],
            ),
          ],
        ),
      );

  Widget _pillInfo(IconData icon, String text, Color color, ThemeData theme) =>
      Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: color),
          const SizedBox(width: 4),
          Text(text,
              style: theme.textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w600,
                color: color,
              )),
        ],
      );

  Widget _timeCard(String label, String time, IconData icon, Color color,
      VoidCallback onTap, ThemeData theme) =>
      InkWell(
        onTap: _editing ? onTap : null,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: color.withOpacity(0.07),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: _editing
                  ? color.withOpacity(0.4)
                  : color.withOpacity(0.15),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(icon, size: 16, color: color),
                  const SizedBox(width: 6),
                  Text(label,
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.55),
                      )),
                  if (_editing) ...[
                    const Spacer(),
                    Icon(Icons.edit_rounded, size: 12, color: color),
                  ],
                ],
              ),
              const SizedBox(height: 6),
              Text(time,
                  style: theme.textTheme.titleMedium
                      ?.copyWith(fontWeight: FontWeight.bold, color: color)),
            ],
          ),
        ),
      );

  Widget _sectionHeader(String text, IconData icon, ThemeData theme) => Row(
        children: [
          Icon(icon, size: 18, color: theme.colorScheme.primary),
          const SizedBox(width: 8),
          Text(text,
              style: theme.textTheme.titleSmall
                  ?.copyWith(fontWeight: FontWeight.bold)),
        ],
      );
}