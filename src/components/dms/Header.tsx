import { Search, Globe, Moon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
const Header = () => {
  return <header className="border-b border-border px-6 py-4 bg-gray-50">
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

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="AI Search" className="pl-10 w-64 bg-background border-border" />
          </div>
          
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Globe className="w-4 h-4 mr-2" />
            العربية
          </Button>
          
          <Button variant="ghost" size="sm">
            <Moon className="w-4 h-4" />
          </Button>
          
          <Avatar className="w-8 h-8 bg-dms-blue">
            <AvatarFallback className="text-white text-sm font-semibold">SS</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>;
};
export default Header;