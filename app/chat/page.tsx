'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DatabaseConnection } from '../components/DatabaseConnection'
import { useToast } from '@/hooks/use-toast'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import ReactMarkdown from 'react-markdown'
import { LLMSelector } from '../components/LLMSelector';
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant';
  content: string;
  tabular_data?: any[];
}

export default function ChatPage() {
  const [dbCredentials, setDbCredentials] = useState({
    db_user: '',
    db_password: '',
    db_host: '',
    db_port: '',
    db_name: ''
  });
  const [useMockDb, setUseMockDb] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast()
  const [selectedData, setSelectedData] = useState<any[] | null>(null);
  const [llmChoice, setLlmChoice] = useState('openai');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDbCredentials({ ...dbCredentials, [e.target.name]: e.target.value });
  };

  const handleUseMockDbChange = (checked: boolean) => {
    setUseMockDb(checked);
    if (checked) {
      setDbCredentials({
        db_user: 'postgres.jseojlyregwrpqqhnxfc',
        db_password: 'easysqlpassword123#',
        db_host: 'aws-0-ap-south-1.pooler.supabase.com',
        db_port: '6543',
        db_name: 'postgres'
      });
    } else {
      setDbCredentials({
        db_user: '',
        db_password: '',
        db_host: '',
        db_port: '',
        db_name: ''
      });
    }
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
        setIsConnected(true);
        toast({
          title: "Connection Successful",
          description: "Successfully connected to the database.",
          variant: "default",
        });
      } else {
        throw new Error('Failed to connect to database');
      }
    } catch (error) {
      console.error('Error connecting to database:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to the database. Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage], dbCredentials, llm_choice: llmChoice }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.content,
        tabular_data: data.tabular_data 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Chat Error",
        description: "An error occurred while processing your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowResults = (data: any[]) => {
    setSelectedData(data);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages]);

  const handleLlmChange = (value: string) => {
    console.log("LLM changed to:", value); // Add this line for debugging
    setLlmChoice(value);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden gap-4">
      {/* Sidebar */}
      <ScrollArea className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out overflow-y-auto flex-shrink-0`}>
        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Configure Chat</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox 
                  id="use-mock-db"
                  checked={useMockDb}
                  onCheckedChange={handleUseMockDbChange}
                />
                <label
                  htmlFor="use-mock-db"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Use Mock Database
                </label>
              </div>
              <div className="mb-4">
                <LLMSelector value={llmChoice} onChange={handleLlmChange} />
              </div>
            </div>
            <DatabaseConnection 
              dbCredentials={dbCredentials} 
              handleCredentialChange={handleCredentialChange} 
              handleConnect={handleConnect}
              isConnecting={isConnecting}
              useMockDb={useMockDb}
            />
          </CardContent>
        </Card>
      </ScrollArea>

      {/* Chat Interface */}
      <div className="flex-grow overflow-hidden">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Chat with Your Database</CardTitle>
            {!isSidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <div className="flex flex-col h-full">
              <div className="flex-grow mb-4 overflow-y-auto scrollbar-hide">
                {messages.map((m, index) => (
                  <div key={index} className="mb-4">
                    <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] p-3 rounded-lg sm:max-w-[50%] md:max-w-[50%] lg:max-w-[50%] ${
                        m.role === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'
                      }`}>
                        {m.role === 'assistant' ? (
                          <div className="overflow-hidden">
                            <ReactMarkdown 
                              className="prose prose-sm max-w-none break-words overflow-wrap-anywhere"
                              components={{
                                p: ({node, ...props}) => <p className="mb-2" {...props} />,
                                pre: ({node, ...props}) => <pre className="overflow-x-auto" {...props} />,
                                code: ({node, ...props}) => <code className="text-xs" {...props} />
                              }}
                            >
                              {m.content.split('[SQL_QUERY]')[0].trim()}
                            </ReactMarkdown>
                            {m.tabular_data && m.tabular_data.length > 0 && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="mt-2 w-full"
                                  >
                                    Show Results
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto">
                                  <DialogHeader>
                                    <DialogTitle>Query Results</DialogTitle>
                                  </DialogHeader>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        {Object.keys(m.tabular_data[0]).map((key) => (
                                          <TableHead key={key}>{key}</TableHead>
                                        ))}
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {m.tabular_data.map((row, rowIndex) => (
                                        <TableRow key={rowIndex}>
                                          {Object.values(row).map((value, cellIndex) => (
                                            <TableCell key={cellIndex}>{value as string}</TableCell>
                                          ))}
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </DialogContent>
                              </Dialog>
                            )}
                            {m.content.includes('[SQL_QUERY]') && (
                              <div className="mt-2 p-2 bg-white rounded-md">
                                <strong>Executed Query:</strong>
                                <pre className="mt-1 p-2 bg-gray-200 rounded-md overflow-x-auto text-sm">
                                  <code>{m.content.split('[SQL_QUERY]')[1].split('[/SQL_QUERY]')[0].trim()}</code>
                                </pre>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="break-words overflow-wrap-anywhere">{m.content}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your data..."
                  className="flex-grow"
                  disabled={!isConnected || isLoading}
                />
                <Button type="submit" disabled={!isConnected || isLoading}>
                  {isLoading ? 'Sending...' : 'Send'}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
