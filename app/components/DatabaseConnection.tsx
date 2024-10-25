import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

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
  useMockDb: boolean;
}

export function DatabaseConnection({
  dbCredentials,
  handleCredentialChange,
  handleConnect,
  isConnecting,
  useMockDb
}: DatabaseConnectionProps) {
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Database Connection</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          {Object.entries(dbCredentials).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{key.replace('_', ' ').toUpperCase()}</Label>
              <Input
                type={key.includes('password') ? 'password' : 'text'}
                id={key}
                name={key}
                value={value}
                onChange={handleCredentialChange}
                disabled={useMockDb}
              />
            </div>
          ))}
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}