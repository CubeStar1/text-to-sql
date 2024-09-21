'use client';

import { useState, useEffect } from 'react';
import { useChat } from 'ai/react';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"

export default function NaturalLanguageQueryInput() {
  const [dbSchema, setDbSchema] = useState('');
  const [tableInfo, setTableInfo] = useState<{[key: string]: string[]}>({});
  const [queryResults, setQueryResults] = useState<any[] | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isUsingCustomDB, setIsUsingCustomDB] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading } = useChat({
    api: '/api/generate-sql',
  });

  useEffect(() => {
    fetchDatabaseSchema();

    // Delete the database when the component unmounts or the page is about to unload
    const handleUnload = async () => {
      try {
        const response = await fetch('/api/delete-db', { method: 'POST' });
        const result = await response.json();
        if (!result.success) {
          console.warn('Failed to delete database:', result.error);
        }
      } catch (error) {
        console.error('Error during database deletion:', error);
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload(); // Also delete when component unmounts
    };
  }, [isUsingCustomDB]);

  useEffect(() => {
    setMessages([
      {
        id: 'system-1',
        role: 'system',
        content: "You are an expert in converting English questions to SQL queries. " +
          "Here's the database schema:\n\n" +
          dbSchema + "\n\n" +
          "Generate SQL queries based on the user's questions. " +
          "Do not include ``` or the word 'sql' in your response. Only provide the SQL query."
      }
    ]);
  }, [dbSchema, setMessages]);

  const fetchDatabaseSchema = async () => {
    const response = await fetch('/api/query-db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: `
          SELECT name, sql FROM sqlite_master
          WHERE type='table' AND name NOT LIKE 'sqlite_%';
        `,
        useCustomDB: isUsingCustomDB
      }),
    });
    const data = await response.json();
    const schemaString = data.results.map((table: any) => 
      `Table: ${table.name}\nSchema: ${table.sql}`
    ).join('\n\n');
    setDbSchema(schemaString);

    const tableNames = data.results.map((table: any) => table.name);
    const tableInfoPromises = tableNames.map((tableName: string) => 
      fetch('/api/query-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `PRAGMA table_info(${tableName});`, useCustomDB: isUsingCustomDB }),
      }).then(res => res.json())
    );
    const tableInfoResults = await Promise.all(tableInfoPromises);
    const newTableInfo: {[key: string]: string[]} = {};
    tableInfoResults.forEach((result, index) => {
      newTableInfo[tableNames[index]] = result.results.map((col: any) => col.name);
    });
    setTableInfo(newTableInfo);
  };

  const executeQuery = async (query: string) => {
    const response = await fetch('/api/query-db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, useCustomDB: isUsingCustomDB }),
    });
    const data = await response.json();
    setQueryResults(data.results);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage('Uploading and processing file...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // First, attempt to delete any existing custom database
      await fetch('/api/delete-db', { method: 'POST' });

      // Then upload the new file
      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        setUploadMessage('File uploaded and database created successfully!');
        setIsUsingCustomDB(true);
        await fetchDatabaseSchema();  // Fetch the new schema after successful upload
      } else {
        setUploadMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setUploadMessage('An error occurred while uploading the file.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Natural Language SQL Query</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Upload Custom CSV File (Optional):</h3>
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          {uploadMessage && <p className="mt-2 text-sm">{uploadMessage}</p>}
          {isUsingCustomDB && (
            <Button onClick={() => setIsUsingCustomDB(false)} className="mt-2">
              Switch to ISRO Database
            </Button>
          )}
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Database Structure:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(tableInfo).map(([tableName, columns]) => (
              <div key={tableName} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <h4 className="font-medium mb-2">{tableName}</h4>
                <p className="text-sm text-gray-600">Columns: {columns.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Enter your question about the data..."
            className="w-full"
            rows={4}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate SQL'}
          </Button>
        </form>
        {messages.length > 1 && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Generated SQL:</h2>
            <pre className="bg-secondary p-4 rounded">{messages[messages.length - 1].content}</pre>
            <Button onClick={() => executeQuery(messages[messages.length - 1].content)} className="mt-2">
              Execute Query
            </Button>
          </div>
        )}
        {queryResults && queryResults.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Query Results:</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(queryResults[0]).map((key) => (
                    <TableHead key={key}>{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {queryResults.map((row, index) => (
                  <TableRow key={index}>
                    {Object.values(row).map((value: any, cellIndex) => (
                      <TableCell key={cellIndex}>{value?.toString() || ''}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}