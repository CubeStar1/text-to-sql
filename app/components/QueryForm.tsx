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
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Enter your question about the data..."
        className="w-full"
        rows={4}
      />
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Generating...' : 'Generate SQL'}
      </Button>
    </form>
  );
}