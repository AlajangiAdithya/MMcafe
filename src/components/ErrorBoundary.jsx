import { Component } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { logError } from '../lib/errorLogger'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info)
    logError('react.boundary', error, { componentStack: info?.componentStack })
  }

  reset = () => this.setState({ error: null })

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="error-boundary">
        <div className="error-boundary-card">
          <AlertTriangle size={32} />
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'Unexpected error'}</p>
          <div className="error-boundary-actions">
            <button className="btn btn-blue" onClick={this.reset}>
              <RotateCcw size={14} /> Try again
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => { this.reset(); window.location.href = '/' }}
            >
              Go home
            </button>
          </div>
        </div>
      </div>
    )
  }
}
