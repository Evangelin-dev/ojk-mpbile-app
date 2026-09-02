# Implementation Plan - Applied Job Detail Screen

Implement a detailed view for applied jobs in the mobile app, matching the features and information present in the web application's `ApplyJob.tsx`.

## User Review Required

> [!IMPORTANT]
> The "Applied Job Detail" screen will show the application progress (Apply, Interview, Hired). Currently, this will be static based on the fact that the application exists (showing "Apply" as complete), as the backend status tracking might not be fully exposed yet.

## Proposed Changes

### Navigation

#### [MODIFY] [AppNavigator.tsx](file:///C:/Bot%20Company%20Projects/ojk-mpbile-app/src/navigation/AppNavigator.tsx)
- Create a `CandidateApplicationStackNavigator` to handle the transition from the application list to the job detail view while maintaining the bottom tab navigation.
- Update `TabNavigator` to use this new stack instead of `CandidateApplicationsScreen` directly.

### Screen Implementation

#### [NEW] [AppliedJobDetailScreen.tsx](file:///C:/Bot%20Company%20Projects/ojk-mpbile-app/src/screens/AppliedJobDetailScreen.tsx)
- Create a new screen to display comprehensive job and application details.
- **Key Sections:**
    - **Header:** Job title, Employer name, Profile image.
    - **Tags:** Job type, Work location, Shift info, Duty hours, Joining fee, Perks.
    - **Application Status Stepper:** Visual progress indicator.
    - **Job Description:** Expandable description.
    - **Job Role Details:** Detailed role information.
    - **Candidate Requirements:** Education, English level, Gender preference, etc.
    - **Walk-in Details:** Conditional section for walk-in interview info.
    - **About Company:** Company overview and contact information.
    - **Similar Jobs:** horizontal list of related job opportunities.
- **Actions:** View submitted CV and Cover Letter.

#### [MODIFY] [CandidateApplicationsScreen.tsx](file:///C:/Bot%20Company%20Projects/ojk-mpbile-app/src/screens/CandidateApplicationsScreen.tsx)
- Wrap application cards in `TouchableOpacity` to navigate to `AppliedJobDetailScreen`.
- Pass the full `application` object to the detail screen.

## Verification Plan

### Automated Tests
- N/A (Manual verification on device preferred for UI layout)

### Manual Verification
1. Open the app as a Candidate.
2. Navigate to "My Application" tab.
3. Click on an applied job card.
4. Verify that the `AppliedJobDetailScreen` opens and displays:
    - All job details (Salary, Location, Perks, etc.).
    - Job description (with show more/less).
    - Requirements and Role details.
    - About Company section.
    - The Application Progress stepper.
    - Similar jobs list.
5. Verify that clicking "View CV" or "Cover Letter" works as expected.
