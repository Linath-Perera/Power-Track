# Power-Track

A React Native mobile application designed to help users monitor electricity consumption, track energy usage, estimate electricity bills, and manage monthly expenses efficiently. PowerTrack promotes energy-saving habits through smart insights and usage tracking.

ICA 03 · Individual React Native Project · Deadline: **15 November 2026**

An offline household electricity manager for Sri Lankan users. Currency: LKR (Rs.). Energy: kWh. Built with JavaScript, Expo SDK 55, React Native, React Navigation, React Hooks/Context, AsyncStorage, Gifted Charts, and Expo Vector Icons.

## Run

Install Node.js 22 LTS or newer. This project was developed with Node 24 and npm 11.

```sh
npm ci
npx expo start
```

Scan the QR code with an **SDK 55 compatible Expo Go**, or press **a** for a configured Android emulator. If the current store version of Expo Go no longer supports SDK 55, use a matching Android Expo Go version from https://expo.dev/go or build a development/release app.

```sh
npm run android
npm run web
npx expo start --offline
```

An iOS simulator requires macOS/Xcode; Windows can use a physical iOS device with a compatible Expo Go installation. An Expo development session loads its bundle from Metro, so airplane-mode testing should use a **standalone release build**. The app itself performs no network requests.

## Standalone Android build for the offline demonstration

A preview APK bundles JavaScript, icons, and assets and runs without Metro or an internet connection after installation.

With Android Studio, Java 17+, the Android SDK, and a configured device/emulator:

```sh
npx expo run:android --variant release
```

This generates the Android native project and downloads build tools on first setup. It requires local native tooling. Alternatively, Expo's optional build service can create an APK:

```sh
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

EAS requires an Expo account and internet **for building only**; it is not an application database or runtime dependency. No cloud build was performed as part of this implementation.

## Screens and navigation

Five bottom tabs provide Home, Appliances, Meter, Analytics, and Settings. The stack also provides the bill calculator, usage history, appliance form/details, meter form, record details, and tariff editor. All seven required functional areas are reachable from the dashboard/settings and tab navigation; secondary screens have back navigation.

- **Dashboard:** local appliance estimates, estimated bill, current month's recorded intervals, appliance count, budget percentage/remaining amount, chart, and shortcuts.
- **Appliances:** add, edit, delete with confirmation, live name search, category filtering, full details, and configurable monthly operating days.
- **Meter:** add/edit/delete readings, sort history, latest cumulative value, and consecutive consumption intervals. Duplicate dates, future dates, invalid calendar dates, and decreasing readings are rejected.
- **Bill calculator:** progressive configurable tariff blocks, energy/fixed/other charges, detailed breakdown, optional notes, and saved estimates with tariff snapshots.
- **Analytics:** real recorded intervals, inferred daily averages, monthly interval comparison, historical differences, total/average summaries, and ranked appliance projections.
- **History:** combined meter/bill records; search by text/date/ID/units; type and month filters; date sorting; full details and confirmed deletion.
- **Settings:** saved monthly budget, 80%/100% UI warnings, tariff editor, persisted dark/light preference, app information, and confirmed demonstration reset.

## Calculation assumptions

Daily appliance consumption = watts × hours ÷ 1000. Monthly estimate = daily consumption × each appliance's configured days (default 30). Appliance estimates describe the **current configuration**, not historical appliance use.

Meter consumption = ending reading − preceding reading. Readings are cumulative and ordered by date. Removing a reading joins adjacent intervals. An interval belongs to its **ending month**, even if it crosses month boundaries. Daily averages are consumption divided by elapsed days; the app does not claim to measure exact daily consumption from sparse readings. Calendar months with only a baseline have no recorded consumption interval.

Dashboard budget spending uses the current **appliance-based bill projection**. Meter figures are shown separately and are never added to appliance estimates. Fixed/other configured charges still apply to a zero-unit bill.

Initial tariff rates are prominently labelled **DEMONSTRATION VALUES**. They are not current official CEB/LECO rates. Blocks apply progressively, upper bounds are cumulative, and the final block is unlimited. Fixed and other charges are flat amounts. Actual utility tariffs may use conditional rules, taxes, or fixed-charge bands beyond this model. Users must configure their own appropriate rates. Historical bills store the full tariff/breakdown snapshot and remain unchanged after tariff edits.

## Local data and offline behavior

AsyncStorage uses these logical collections under `@powertrack/v1/`:

| Key         | Contents                                                        |
| ----------- | --------------------------------------------------------------- |
| appliances  | IDs, names, categories, watts, hours, days, creation dates      |
| readings    | IDs, ISO dates, cumulative kWh, notes                           |
| bills       | IDs, dates, units, charges, breakdowns, notes, tariff snapshots |
| budget      | Monthly LKR amount                                              |
| tariff      | Configuration label, progressive blocks, fixed/other charges    |
| preferences | Light/dark theme                                                |

A separate initialized marker seeds only on first launch. Missing collections from an interrupted initial seed are filled without overwriting existing collections. Saved empty arrays stay empty on relaunch. Writes are serialized and visible state changes only after storage reports success. Failed loads display a retry screen; invalid persisted data is not silently overwritten. AsyncStorage does not guarantee an atomic multi-collection reset if the operating system terminates the process mid-write.

The student-created seed contains seven appliances, four nondecreasing monthly readings, and three matching bill calculations. Dates are relative to the launch month. Samples are demonstrations, not household measurements. Reset restores all collections only after confirmation. Uninstalling or clearing device data removes records. No public APIs, remote authentication, analytics service, or online database is used.

## Project layout

```text
App.js / index.js       App bootstrap, provider, safe areas
assets/                Local logo / splash / launcher assets
src/components/        Shared themed UI and chart
src/context/           Global state and serialized persistence
src/data/              Student-created demonstration dataset
src/navigation/        Tabs and stack routes
src/screens/           Seven functional areas and secondary screens
src/storage/           AsyncStorage adapter and testable repository
src/theme/             Dark and light palettes
src/utils/             Calculations, validation, dates, and dialogs
tests/                 Domain and persistence tests
e2e/                   Browser interaction checks
scripts/               Source/import check and asset generation
```

## Automated verification

```sh
npm test
npm run lint
npm run format:check
npx expo install --check
npx expo-doctor
npx expo export --platform all
```

Browser interaction tests use Chromium:

```sh
npx playwright install chromium
npm run test:e2e
```

Unit tests cover calculation boundaries, tariff validation, meter chronology, duplicate dates, calendar validation, budget thresholds, coherent seeded bills, first-run seeding, edited/deleted data after reopening the repository, interrupted initialization, reset, and storage error propagation. Browser tests supplement these with real interactions; they do not prove native device behavior. See **TESTING.md** for executed results and the remaining device checklist.

## GitHub repository

This project is maintained at [Linath-Perera/Power-Track](https://github.com/Linath-Perera/Power-Track). `node_modules`, builds, local Expo state, and secret/signing files are ignored; commit the lockfile.
