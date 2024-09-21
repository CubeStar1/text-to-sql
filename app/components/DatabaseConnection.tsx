import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface DatabaseConnectionProps {
  dbCredentials: {
    db_user: string;
    db_password: string;
    db_host: string;
    db_port: string;
    db_name: string;
  };
  handleCredentialChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleConnect: () => void;
  isConnecting: boolean;
}

export function DatabaseConnection({ 
  dbCredentials, 
  handleCredentialChange, 
  handleConnect,
  isConnecting 
}: DatabaseConnectionProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Database Connection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            name="db_user"
            value={dbCredentials.db_user}
            onChange={handleCredentialChange}
            placeholder="Database User"
          />
          <Input
            name="db_password"
            type="password"
            value={dbCredentials.db_password}
            onChange={handleCredentialChange}
            placeholder="Database Password"
          />
          <Input
            name="db_host"
            value={dbCredentials.db_host}
            onChange={handleCredentialChange}
            placeholder="Database Host"
          />
          <Input
            name="db_port"
            value={dbCredentials.db_port}
            onChange={handleCredentialChange}
            placeholder="Database Port"
          />
          <Input
            name="db_name"
            value={dbCredentials.db_name}
            onChange={handleCredentialChange}
            placeholder="Database Name"
          />
          <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}