import { Globe, Moon, Sun, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import AISearchInput from "./AISearchInput";
import UserAvatarDropdown from "./UserAvatarDropdown";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { user } = useAuth();

  // Early return if contexts are not properly initialized
  if (!theme || !language) {
    return (
      <header className="border-b border-border px-6 py-4 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-dms-purple to-dms-blue rounded-lg">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-dms-purple rounded-sm"></div>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Document Archiving <span className="text-dms-purple">System</span>
              </h1>
              <p className="text-sm text-muted-foreground">AI-Powered Document Management</p>
            </div>
          </div>
          <div className="animate-pulse">{t('loading')}</div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-border px-6 py-4 bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-dms-purple to-dms-blue rounded-lg">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-dms-purple rounded-sm"></div>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {t('documentArchivingSystem')} <span className="text-dms-purple">System</span>
            </h1>
            <p className="text-sm text-muted-foreground">{t('aiPoweredDms')}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <AISearchInput />
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground"
            onClick={toggleLanguage}
          >
            <Globe className="w-4 h-4 mr-2" />
            {t('language')}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleTheme}
            className="hover:bg-accent"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </Button>
          
          {user && <NotificationCenter />}
          
          {user ? (
            <UserAvatarDropdown />
          ) : (
            <Button variant="outline" size="sm">
              {t('signIn')}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;