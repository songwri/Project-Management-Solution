import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error:', error, info.componentStack)
  }

  handleReset = () => {
    localStorage.clear()
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-svh flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-lg font-semibold text-slate-800">문제가 발생했습니다</p>
          <p className="max-w-md text-sm text-slate-500">
            화면을 표시하는 중 오류가 발생했습니다. 저장된 데이터를 초기화하고 다시 시도해 주세요.
          </p>
          <pre className="max-w-xl overflow-x-auto rounded-lg bg-slate-100 px-3 py-2 text-left text-xs text-rose-600">
            {this.state.error.message}
          </pre>
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            초기화 후 새로고침
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
