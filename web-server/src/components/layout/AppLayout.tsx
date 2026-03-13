import { AuthProvider } from "../../contexts/AuthContext";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Outlet, useNavigation } from "react-router";
import { ChatBtn } from "../ui/aiChatBtn";
import { DocBtn } from "../ui/aiDocBtn";

export const AppLayout = () => {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <AuthProvider>
      <div className="min-h-dvh flex flex-col">
        <Header />

        {/* make main a flex container */}
        <main className="flex-1 min-h-0 flex flex-col">
          {isLoading && (
            <div className="container py-3">
              <span className="loading loading-ring loading-xs"></span>
              <span className="loading loading-ring loading-sm"></span>
              <span className="loading loading-ring loading-md"></span>
              <span className="loading loading-ring loading-lg"></span>
              <span className="loading loading-ring loading-xl"></span>
            </div>
          )}

          {/* outlet area needs to be flex-1 */}
          <div className="flex-1 min-h-0">
            <Outlet />
          </div>
        </main>
        <ChatBtn />
        <Footer />
      </div>
      <ChatBtn />
      <DocBtn />
      <Footer />
    </>
  );
};

// import { Footer } from "./Footer";
// import { Header } from "./Header";
// import { Outlet, useNavigation } from "react-router";
// import { ChatBtn } from "../ui/aiChatBtn";

// export const AppLayout = () => {
//   const navigation = useNavigation();
//   const isLoading = navigation.state === "loading";

//   return (
//     <>
//       <Header />
//       <div className="min-h-dvh">
//         {isLoading && (
//           <div className="container">
//             <span className="loading loading-ring loading-xs"></span>
//             <span className="loading loading-ring loading-sm"></span>
//             <span className="loading loading-ring loading-md"></span>
//             <span className="loading loading-ring loading-lg"></span>
//             <span className="loading loading-ring loading-xl"></span>
//           </div>
//         )}
//         <Outlet />
//       </div>
//       <ChatBtn />
//       <Footer />
//     </>
//   );
// };
