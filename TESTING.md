# Verification record

Executed on **4 November 2026**, Windows, Node 24.14.0, npm 11.9.0.

## Automated checks

- `npm test`: **13/13 passed**. Domain calculations/validation and storage adapter tests.
- `npm run lint`: JavaScript/JSX parsing and local import resolution passed for all application source files. This is a source integrity check, not a full ESLint ruleset.
- `npx expo install --check`: dependency versions compatible with installed Expo SDK.
- `npx expo-doctor`: **20/20 passed** after installing the compatible expo-font dependency.
- `npx expo export --platform all`: Android Hermes, iOS Hermes, and web production JavaScript bundles exported successfully. This is not an APK/IPA native build.
- `npm run test:e2e`: browser interaction suites verify appliance CRUD/search/categories/details; invalid and valid meter input, edit/delete; bill save/details/delete; budget validation/warnings; custom tariff editing; light theme persistence; resetting data; empty appliance/analytics states; reload persistence; and creating an appliance while browser networking is disabled, then retaining it after reload.
- Dashboard screenshot inspected at a 390 × 844 browser viewport. Screenshots and traces are local ignored test artifacts under `test-results/`.

The automated tests use isolated browser contexts or an injected in-memory storage adapter. A browser reload demonstrates real web AsyncStorage persistence. Native application process death/relaunch is a separate manual check.

## Dependency audit

`npm audit --json` reported **26 findings: 1 low, 23 moderate, 2 high** in the selected SDK's dependency tree. Findings include Expo/React Native tooling dependencies (glob/minimatch, Zod, and related packages). npm's proposed resolution involves major Expo/React Native upgrades. No forced major upgrade or untested transitive override was applied. SDK 55 versions remain aligned and Expo Doctor passes. The app has no runtime network calls, but these audit findings remain unresolved and should be reviewed before broader distribution.

## Native device checklist — not executed here

No configured Android emulator/ADB or iOS runtime was available. These items remain unverified on a native device:

- [ ] Install a standalone release build and inspect the splash/launcher icon.
- [ ] Cold launch with airplane mode already enabled; check all seven functional areas.
- [ ] Add/edit/delete appliances and readings while offline.
- [ ] Search/filter saved records, open details, calculate/save a bill while offline.
- [ ] Close/force-stop the app, reopen, and confirm saved records, tariffs, budget, and theme.
- [ ] Check Android hardware back, iOS back gestures, safe areas, small screens, and keyboard-aware forms.
- [ ] Confirm both light/dark themes and charts on Android/iOS.
- [ ] Confirm meter dates/decimal entry, duplicate date rejection, and declining historical edit rejection.
- [ ] Confirm destructive dialogs offer cancellation and successful deletion.
- [ ] Confirm the 80% and 100% budget warning states.
- [ ] Remove records and verify empty states; confirm no demonstration data reappears after relaunch.
- [ ] Confirm reset replaces all six logical collections after confirmation.

Use a release build for airplane-mode cold launching. Expo Go's development bundle may still depend on Metro even though PowerTrack's application data and calculations are offline.

## Demonstration walkthrough

1. Show dashboard labels separating appliance estimates and recorded meter intervals.
2. Add a 75 W fan used 8 hours/day for 30 days; verify 0.6 kWh/day and 18 kWh/month.
3. Search its name, filter Cooling, open details, and edit configured days.
4. Add a meter reading after the latest saved date with a nondecreasing cumulative value; show interval consumption.
5. Calculate 65 units using initial demonstration tariffs: energy Rs. 700 + fixed Rs. 250 = **Rs. 950**.
6. Save the bill, change a tariff, and show that the historical estimate retains its original tariff snapshot.
7. Open analytics, filter a month, and explain the interval-ending-month grouping and inferred daily averages.
8. Lower the budget to trigger warnings, change theme, and reopen the app to demonstrate persistence.
9. Demonstrate the same core actions in airplane mode on the standalone build.

## Recheck: 14 November 2026

- `npm test`: 13/13 passed.
- `npm run lint`: 19 source files parsed; relative imports resolve.
- `npm run format:check`: passed after normalizing working-copy line endings and adding `.prettierrc.json` with `endOfLine: auto` to support Windows checkouts.
- `npm run check`: Expo dependency compatibility passed.
- `npm run test:e2e`: 3/3 browser interaction suites passed.
- `npx expo export --platform all`: Android, iOS, and web production bundles exported successfully.

Native device behavior and dependency audit findings above were not revalidated in this recheck. These results do not establish that every possible runtime path is free of defects.
