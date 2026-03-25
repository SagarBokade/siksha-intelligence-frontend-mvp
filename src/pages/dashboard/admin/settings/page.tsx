
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileImageUploader } from "@/components/shared/ProfileImageUploader";
import { setCredentials } from "@/store/slices/authSlice";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.accessToken);

  const handleProfileImageUpdate = (newUrl: string) => {
    if (user && token) {
      // Optimistically update the Redux store so the Topbar updates immediately
      dispatch(setCredentials({
        user: { ...user, profileUrl: newUrl },
        accessToken: token,
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Account Settings</h3>
        <p className="text-muted-foreground">
          Manage your account profile and display preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Update the avatar that others see next to your name. Click the camera icon or drag an image over to upload a new one. Max size: 5MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <ProfileImageUploader
            currentProfileUrl={user?.profileUrl}
            name={user?.username}
            onUploadSuccess={handleProfileImageUpdate}
          />
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.username || "Admin User"}
            </p>
            <p className="text-sm text-muted-foreground">
              {user?.email || "No email provided"}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Future Settings form elements usually go here */}
    </div>
  );
}
