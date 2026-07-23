import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Title } from '@/components/ui/Title';
import { logger } from '@/services/loggerService';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('ErrorBoundary', error.message, {
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-app-gradient p-6">
          <Card className="max-w-md space-y-4">
            <Title level={2}>Something went wrong</Title>
            <p className="text-sm text-ink-muted">{this.state.error.message}</p>
            <Button
              type="button"
              onClick={() => {
                this.setState({ error: null });
                window.location.assign(import.meta.env.BASE_URL);
              }}
            >
              Reload
            </Button>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
