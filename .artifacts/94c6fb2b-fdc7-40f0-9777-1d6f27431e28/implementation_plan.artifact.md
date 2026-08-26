# Fix Navigation Error for "Post Jobs" from Menu Screen

The goal is to resolve the navigation error that occurs when clicking "Post Jobs" in the `MenuScreen`. The error happens because the `PostJob` screen is deeply nested within a tab navigator (`MainTabs` -> `Jobs` -> `PostJob`), and the current navigation call in `MenuScreen` does not provide the full path.

To make the "Post Job" workflow more accessible and resolve this issue cleanly, I will move the `PostJobScreen` to the root stack navigator. This allows any screen in the app to navigate to it directly using `navigation.navigate('PostJob')`.

## Proposed Changes

### [Component Name] Navigation

#### [MODIFY] [AppNavigator.tsx](file:///C:/Bot Company Projects/ojk-mpbile-app/src/navigation/AppNavigator.tsx)
- Move `PostJobScreen` from `JobStackNavigator` to the root `Stack.Navigator`.
- This makes `PostJob` a top-level screen reachable from both the `MainTabs` and the `Menu` screen.

#### [MODIFY] [MenuScreen.tsx](file:///C:/Bot Company Projects/ojk-mpbile-app/src/screens/MenuScreen.tsx)
- Update the navigation call for "Post Jobs" to use the direct screen name: `navigation.navigate('PostJob')`.

#### [MODIFY] [EmployerDashboardScreen.tsx](file:///C:/Bot Company Projects/ojk-mpbile-app/src/screens/EmployerDashboardScreen.tsx)
- Update the "Post Job" quick action to use the direct screen name: `navigation.navigate('PostJob')`.

#### [MODIFY] [PostJobScreen.tsx](file:///C:/Bot Company Projects/ojk-mpbile-app/src/screens/PostJobScreen.tsx)
- Ensure the "Back to Jobs" button correctly navigates back to the job list within the tabs.

## Verification Plan

### Manual Verification
- Launch the app.
- Navigate to the **Menu** screen (Actions tab).
- Click **Post Jobs**. Verify that `PostJobScreen` opens without errors.
- Navigate to the **Dashboard** tab.
- Click the **Post Job** quick action. Verify it opens correctly.
- Navigate to the **Jobs** tab.
- Click **Post Job** (if available on that screen). Verify it opens correctly.
- In `PostJobScreen`, click **Back to Jobs** and verify it returns to the job list.
