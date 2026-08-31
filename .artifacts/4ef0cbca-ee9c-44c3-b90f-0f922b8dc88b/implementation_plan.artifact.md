# Fix Navigation from PostJobScreen to Home

The goal is to fix the navigation issue where the app fails to navigate to the Home screen after a job is successfully posted. The error occurs because the "Home" screen is nested within the "MainTabs" navigator, and the current navigation call in `PostJobScreen.tsx` does not account for this nesting.

## Proposed Changes

### Navigation

#### [MODIFY] [PostJobScreen.tsx](file:///C:/Bot%20Company%20Projects/ojk-mpbile-app/src/screens/PostJobScreen.tsx)
- Update the `handleSubmit` function to correctly navigate to the "Home" screen within the "MainTabs" navigator.
- Instead of `navigation.navigate("Home")`, use `navigation.navigate("MainTabs", { screen: "Home" })`.

## Verification Plan

### Automated Tests
- Not applicable for this UI navigation fix.

### Manual Verification
1. Navigate to the "Post Job" screen.
2. Fill in the required job details.
3. Tap the "Post Job" button.
4. Verify that the "Success" alert appears.
5. Tap "OK" on the alert and verify that the app successfully navigates to the Home screen without an error toast.
