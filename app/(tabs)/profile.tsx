import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DarkModeSwitch } from '@/components/dumpwatch/DarkModeSwitch';
import { GreenHero } from '@/components/dumpwatch/GreenHero';
import { ReportFeed } from '@/components/dumpwatch/ReportFeed';
import { useReports } from '@/context/ReportsProvider';
import { useAppTheme, useThemedStyles } from '@/context/ThemeProvider';
import { splitByKind } from '@/lib/mediaSlots';
import { radii, type ThemeColors } from '@/lib/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { profile, myReports, setDisplayName, requestDelete, setReportEmojis } = useReports();
  const [name, setName] = useState(profile.displayName);
  const [reasonFor, setReasonFor] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const { dumping, water } = splitByKind(myReports);
  const openReport = (id: string) => router.push({ pathname: '/report/[id]', params: { id } });

  useEffect(() => {
    setName(profile.displayName);
  }, [profile.displayName]);

  const submitDelete = async () => {
    if (!reasonFor || !reason.trim()) return;
    await requestDelete(reasonFor, reason);
    setReasonFor(null);
    setReason('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <GreenHero kicker="Your watch" title="Profile" subtitle="Your reports stay on the public feed. You can only request a deletion." />
        <View style={styles.card}>
          <Text style={styles.label}>Display name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            onBlur={() => setDisplayName(name)}
            style={styles.input}
            placeholder="Resident"
            placeholderTextColor={colors.muted}
          />
          <Text style={styles.help}>Saved on this device only. No account is required.</Text>
        </View>

        <Text style={styles.section}>Settings</Text>
        <View style={styles.card}>
          <DarkModeSwitch />
        </View>

        <View style={[styles.card, styles.balanceCard]}>
          <Text style={[styles.label, styles.balanceLabel]}>Rewards balance</Text>
          <Text style={styles.balance}>R0.00</Text>
          <Text style={[styles.help, styles.balanceHelp]}>
            DumpWatch posts can earn up to R300. WaterWatch posts can earn up to R20. Rewards stay at
            R0.00 until a report is proven true and a case leads to prosecution.
          </Text>
          <View style={styles.row}>
            <Pressable style={styles.disabledBtn} disabled>
              <Text style={styles.disabledText}>Withdraw</Text>
            </Pressable>
            <Pressable style={styles.disabledBtn} disabled>
              <Text style={styles.disabledText}>Redeem</Text>
            </Pressable>
          </View>
        </View>

        <ReportFeed
          title="My DumpWatch reports"
          empty="You have not submitted a dumping report yet."
          reports={dumping}
          onOpen={openReport}
          onChangeEmojis={setReportEmojis}
          footer={(report) =>
            report.status === 'deletion_requested' ? (
              <Text style={styles.requested}>Deletion requested — the report stays visible.</Text>
            ) : (
              <Pressable style={styles.deleteBtn} onPress={() => setReasonFor(report.id)}>
                <Text style={styles.deleteText}>Request delete</Text>
              </Pressable>
            )
          }
        />

        <View style={styles.waterBlock}>
          <ReportFeed
            title="My water and sewer reports"
            empty="You have not submitted a water or sewer report yet."
            reports={water}
            tone="water"
            onOpen={openReport}
            onChangeEmojis={setReportEmojis}
            footer={(report) =>
              report.status === 'deletion_requested' ? (
                <Text style={styles.requested}>Deletion requested — the report stays visible.</Text>
              ) : (
                <Pressable style={styles.deleteBtn} onPress={() => setReasonFor(report.id)}>
                  <Text style={styles.deleteText}>Request delete</Text>
                </Pressable>
              )
            }
          />
        </View>
      </ScrollView>

      <Modal visible={Boolean(reasonFor)} transparent animationType="fade" onRequestClose={() => setReasonFor(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.label}>Why should this come down?</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Reason"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.multiline]}
              multiline
            />
            <View style={styles.row}>
              <Pressable style={styles.deleteBtn} onPress={submitDelete}>
                <Text style={styles.deleteText}>Submit request</Text>
              </Pressable>
              <Pressable onPress={() => setReasonFor(null)} style={styles.backBtn}>
                <Text style={styles.help}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8, gap: 12 },
  section: {
    color: colors.heading,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  waterBlock: {
    backgroundColor: colors.waterBand,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.line,
    boxShadow: colors.shadowDump,
  },
  balanceCard: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: radii.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  help: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 8 },
  balanceLabel: { color: colors.kicker },
  balanceHelp: { color: colors.heroCopy },
  balance: { color: colors.cream, fontSize: 36, fontWeight: '800' },
  row: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' },
  disabledBtn: {
    backgroundColor: colors.onForestFaint,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    opacity: 0.7,
    justifyContent: 'center',
  },
  disabledText: { color: colors.kicker, fontWeight: '700' },

  deleteBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.clay,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
    marginBottom: 12,
  },
  deleteText: { color: colors.accent, fontWeight: '700' },
  requested: { color: colors.accent, fontSize: 13, marginTop: -8, marginBottom: 14 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 20,
  },
  backBtn: { minHeight: 44, justifyContent: 'center' },
});
