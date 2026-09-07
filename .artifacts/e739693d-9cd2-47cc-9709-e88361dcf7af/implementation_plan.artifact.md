# Fix Candidate Profile Photo Not Showing

The candidate profile photo is not displaying in the profile screen and the header after an update, even though it works for employers. This is likely due to non-robust response handling in the candidate profile screen and potential mismatch in property names between the API and the frontend.

## Proposed Changes

### [Candidate Components]

#### [MODIFY] [CandidateProfileScreen.tsx](file:///C:/Bot Company Projects/ojk-mpbile-app/src/screens/CandidateProfileScreen.tsx)
- Update `fetchProfile` and `handleUpdateProfile` to use a more robust response handling mechanism (checking `response.data.profile || response.profile`).
- Ensure both `profileImage` and `profilePhoto` properties are checked from the API response, as there might be a naming discrepancy.
- Ensure the global user state is updated correctly with the profile image URL.
- Fix the `updateUser` call in `handleUpdateProfile` to use the robustly fetched profile data.

#### [MODIFY] [Header.tsx](file:///C:/Bot Company Projects/ojk-mpbile-app/src/components/Header.tsx)
- No changes needed here if `updateUser` in the profile screen is fixed to provide the correct `profileImage`.

## Verification Plan

### Manual Verification
- Log in as a candidate.
- Navigate to the Profile screen.
- Click "Edit Profile".
- Upload a new profile photo.
- Click "Save".
- Verify that the photo appears in the profile header card.
- Verify that the photo appears in the top-right header avatar.
- Refresh the app or navigate away and back to ensure it persists.
