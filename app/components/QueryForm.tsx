import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface QueryFormProps {
  question: string;
  setQuestion: (question: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function QueryForm({ question, setQuestion, handleSubmit, isLoading }: QueryFormProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Enter your question here..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="min-h-[100px]"
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate SQL'}
      </Button>
    </form>
  );
}