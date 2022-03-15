import React, { ReactElement } from "react";

interface IState {
  hasError?: boolean;
}

class ErrorBoundary extends React.Component {
  state: IState = {};
  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: any) {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: any, errormsg: any) {
    console.log("error ", error, errormsg);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return <div>An Error occurred</div>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
