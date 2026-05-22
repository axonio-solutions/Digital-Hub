import Ionicons from '@expo/vector-icons/Ionicons'
import { StyleSheet, Text, TextInput, View } from 'react-native'

import { radius, spacing, typography } from '../../theme/tokens'
import { useTheme } from '../../theme/use-theme'

interface Props {
  vehicleModel: string
  modelYear: string
  vinNumber: string
  onChangeModel: (v: string) => void
  onChangeYear: (v: string) => void
  onChangeVin: (v: string) => void
}

export function VehicleInfoStep({
  vehicleModel,
  modelYear,
  vinNumber,
  onChangeModel,
  onChangeYear,
  onChangeVin,
}: Props) {
  const t = useTheme()

  return (
    <View style={styles.step}>
      <View style={styles.header}>
        <Ionicons name="car-outline" size={20} color={t.primary} />
        <Text style={[styles.title, { color: t.text }]}>Vehicle Info</Text>
      </View>
      <Text style={[styles.subtitle, { color: t.textMuted }]}>
        Enter your vehicle's model and year for compatibility.
      </Text>

      <View style={styles.row}>
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Ionicons name="car-outline" size={14} color={t.primary} />
            <Text style={[styles.label, { color: t.textMuted }]}>
              Model / Version
            </Text>
          </View>
          <TextInput
            value={vehicleModel}
            onChangeText={onChangeModel}
            placeholder="e.g. Golf 7 GTI, 320d"
            placeholderTextColor={t.textSubtle}
            style={[
              styles.input,
              {
                color: t.text,
                backgroundColor: t.surface,
                borderColor: t.border,
              },
            ]}
            autoCapitalize="sentences"
            returnKeyType="next"
          />
        </View>

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Ionicons name="calendar-outline" size={14} color={t.primary} />
            <Text style={[styles.label, { color: t.textMuted }]}>
              Model Year
            </Text>
          </View>
          <TextInput
            value={modelYear}
            onChangeText={onChangeYear}
            placeholder="e.g. 2022"
            placeholderTextColor={t.textSubtle}
            style={[
              styles.input,
              {
                color: t.text,
                backgroundColor: t.surface,
                borderColor: t.border,
              },
            ]}
            keyboardType="number-pad"
            maxLength={4}
            returnKeyType="next"
          />
        </View>
      </View>

      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Ionicons name="barcode-outline" size={14} color={t.primary} />
          <Text style={[styles.label, { color: t.textMuted }]}>VIN Number</Text>
          <View style={styles.vinHint}>
            <Ionicons
              name="help-circle-outline"
              size={14}
              color={t.textSubtle}
            />
          </View>
        </View>
        <TextInput
          value={vinNumber}
          onChangeText={onChangeVin}
          placeholder="Enter 17-digit VIN"
          placeholderTextColor={t.textSubtle}
          style={[
            styles.input,
            styles.vinInput,
            {
              color: t.text,
              backgroundColor: t.surface,
              borderColor: t.border,
            },
          ]}
          autoCapitalize="characters"
          maxLength={17}
          returnKeyType="done"
        />
      </View>

      <View
        style={[
          styles.infoBox,
          {
            borderColor: t.accent + '30',
            backgroundColor: t.accent + '08',
          },
        ]}
      >
        <View
          style={[
            styles.infoIconBox,
            {
              backgroundColor: t.bg,
              borderColor: t.accent + '30',
            },
          ]}
        >
          <Ionicons name="car-outline" size={16} color={t.accent} />
        </View>
        <View style={styles.infoText}>
          <Text style={[styles.infoTitle, { color: t.accent }]}>
            Why model and year matter?
          </Text>
          <Text style={[styles.infoBody, { color: t.textMuted }]}>
            Accurate vehicle details help sellers find the right part faster and
            avoid mismatches.
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  step: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.body,
    marginTop: -spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  field: {
    flex: 1,
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  vinHint: {
    marginLeft: 'auto',
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
  },
  vinInput: {
    fontFamily: 'monospace',
    fontSize: 15,
    letterSpacing: 1.5,
  },
  infoBox: {
    flexDirection: 'row',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  infoBody: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
})
