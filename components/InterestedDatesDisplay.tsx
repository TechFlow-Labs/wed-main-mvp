import { View, Text } from 'react-native';
import { parseInterestedDateTokens, formatInterestedDateToken } from '../lib/interestedDatesFormat';

type InterestedDatesDisplayProps = {
  value: string;
};

/**
 * Renders comma-separated YYYY-MM-DD values as a short list with localized Greek dates.
 */
export function InterestedDatesDisplay({ value }: InterestedDatesDisplayProps) {
  const tokens = parseInterestedDateTokens(value);
  if (tokens.length === 0) {
    return <Text className="text-sm text-gray-700">—</Text>;
  }

  return (
    <View className="gap-2">
      {tokens.map((token, i) => (
        <View key={`${token}-${i}`} className="flex-row items-start gap-2">
          <Text className="text-sm text-wed-accent mt-0.5">●</Text>
          <Text className="text-sm text-gray-800 leading-5 flex-1">{formatInterestedDateToken(token)}</Text>
        </View>
      ))}
    </View>
  );
}
