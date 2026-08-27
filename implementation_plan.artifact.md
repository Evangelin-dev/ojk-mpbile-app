# Implementation Plan - Billing Screen Migration

Migrate the web-based Billing component to a native mobile screen for the employer section of the OJK Jobs app.

## User Review Required

> [!IMPORTANT]
> The original web code used `i18next` for translations and a `generateInvoice` service. Since these are not present in the current mobile project, I will use hardcoded English strings (matching the web labels) and a placeholder for the invoice action (showing an alert).

## Proposed Changes

### API Layer

#### [MODIFY] [employer.ts](file:///C:/Bot%20Company%20Projects/ojk-mpbile-app/src/api/employer.ts)
- Add `fetchBillingHistory` function to interact with `/api/payments/employer/billing`.

### Navigation

#### [MODIFY] [AppNavigator.tsx](file:///C:/Bot%20Company%20Projects/ojk-mpbile-app/src/navigation/AppNavigator.tsx)
- Import `BillingScreen`.
- Add `Billing` screen to `ActionsStackNavigator`.

#### [MODIFY] [MenuScreen.tsx](file:///C:/Bot%20Company%20Projects/ojk-mpbile-app/src/screens/MenuScreen.tsx)
- Update the "Billing" menu item to navigate to the new `Billing` screen.

### Screens

#### [NEW] [BillingScreen.tsx](file:///C:/Bot%20Company%20Projects/ojk-mpbile-app/src/screens/BillingScreen.tsx)
- Create a new screen using React Native components (`View`, `Text`, `FlatList`, `TouchableOpacity`).
- Implement status filtering and pagination.
- Adapt the styling to match the project's theme (yellow/white).

## Verification Plan

### Automated Tests
- I will verify the screen renders correctly by using `render_compose_preview` if applicable, but since this is React Native, I'll rely on manual verification by the user or checking the code structure.

### Manual Verification
- The user should navigate to "Actions" -> "Billing" and verify:
    - Billing history is loaded from the API.
    - Filters (All, Success, Pending, Failed) work as expected.
    - Pagination works if there are multiple pages.
    - The "Invoice" button shows an alert (as the service is missing).
