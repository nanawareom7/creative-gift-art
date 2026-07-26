import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="font-serif text-2xl text-foreground mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.history.back();
            }}
            className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition"
          >
            Go Back
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
