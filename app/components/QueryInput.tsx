'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DatabaseConnection } from './DatabaseConnection';
import { DatabaseStructure } from './DatabaseStructure';
import { QueryForm } from './QueryForm';
import { QueryResults } from './QueryResults';
import { useToast } from '@/hooks/use-toast';

export default function NaturalLanguageQueryInput() {
  const [dbCredentials, setDbCredentials] = useState({
    db_user: '',
    db_password: '',
    db_host: '',
    db_port: '',
    db_name: ''
  });
  const [question, setQuestion] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResults, setQueryResults] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [dbStructure, setDbStructure] = useState<{[key: string]: string[]}|null>(null);
  const { toast } = useToast()

  const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDbCredentials({ ...dbCredentials, [e.target.name]: e.target.value });
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/db-structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ db_credentials: dbCredentials }),
      });
      if (response.ok) {
        const data = await response.json();
        setDbStructure(data.structure);
        toast({
          title: "Connection Successful",
          description: "Successfully connected to the database.",
          variant: "default",
        })
      } else {
        throw new Error('Failed to connect to database');
      }
    } catch (error) {
      console.error('Error connecting to database:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to the database. Please check your credentials and try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          db_credentials: dbCredentials
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const data = await response.json();
      setSqlQuery(data.sql_query);
      setQueryResults(data.results);
      toast({
        title: "Query Generated",
        description: "SQL query has been successfully generated and executed.",
        variant: "default",
      })
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Query Error",
        description: "An error occurred while processing your query. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-0">
      <div className="w-full lg:w-1/3">
        <DatabaseConnection 
          dbCredentials={dbCredentials} 
          handleCredentialChange={handleCredentialChange} 
          handleConnect={handleConnect}
          isConnecting={isConnecting}
        />
        <DatabaseStructure dbStructure={dbStructure} />
      </div>

      <Card className="w-full lg:w-2/3">
        <CardHeader>
          <CardTitle>Natural Language SQL Query</CardTitle>
        </CardHeader>
        <CardContent>
          <QueryForm 
            question={question}
            setQuestion={setQuestion}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
          <QueryResults sqlQuery={sqlQuery} queryResults={queryResults} />
        </CardContent>
      </Card>
    </div>
  );
}