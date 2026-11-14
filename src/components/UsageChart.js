import React from "react";
import { ScrollView, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { usePower } from "../context/PowerContext";
import { Label, Empty } from "./UI";
export default function UsageChart({ data, title, subtitle }) {
  const { colors: c } = usePower();
  return (
    <View style={{ gap: 12 }}>
      <Label style={{ fontSize: 18, fontWeight: "700" }}>{title}</Label>
      {subtitle && (
        <Label muted style={{ fontSize: 12 }}>
          {subtitle}
        </Label>
      )}
      {!data.length ? (
        <Empty
          title="No usage records"
          text="Save at least two meter readings, or add appliances for estimates."
        />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ paddingTop: 18, paddingRight: 20 }}>
            <BarChart
              key={c.bg + JSON.stringify(data)}
              data={data.map((d) => ({
                ...d,
                value: Number(d.value) || 0,
                frontColor: c.green,
                labelTextStyle: { color: c.muted, fontSize: 10 },
              }))}
              width={Math.max(260, data.length * 55)}
              height={160}
              barWidth={24}
              spacing={26}
              barBorderRadius={6}
              noOfSections={4}
              yAxisThickness={0}
              xAxisColor={c.border}
              rulesColor={c.border}
              yAxisTextStyle={{ color: c.muted, fontSize: 10 }}
              hideRules={false}
              isAnimated={false}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}
