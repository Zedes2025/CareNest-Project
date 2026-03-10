import { isRouteErrorResponse, useRouteError } from "react-router";

export default function ErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>An Error Occurred</h1>
        <h1>
          {error.status} {error.statusText}
        </h1>
      </div>
    );
  }
}
