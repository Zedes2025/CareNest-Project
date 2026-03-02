import { Link } from "react-router";

export const Nav = () => {
  return (
    <div className="navbar bg-base-100 shadow-sm p-0 mb-5">
      <div className="container flex items-center">
        <div className="navbar-start lg:hidden flex-1">
          <Link className="btn mr-2">AI CHAT HERE</Link>
          <Link className="btn mr-2">AI CHAT HERE</Link>
        </div>
      </div>
    </div>
  );
};

//     <Link to="/" className="p-0">
//       <img src="/logo.svg" width="200px" alt="" />
//     </Link>
//   </div>
//   <div className="navbar-end flex-1">
//     <div className="menu menu-horizontal hidden lg:flex">
//       <Link className="btn btn-ghost" to="/">
//         View All Events
//       </Link>
//       <Link className="btn btn-ghost" to="/create/event">
//         Create Event
//       </Link>
//     </div>

//     <>
//       <Link className="btn mr-2" to="/logout">
//         Logout
//       </Link>
//       <div className="w-10 rounded-full overflow-hidden">
//         <img
//           alt="Tailwind CSS Navbar component"
//           src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
//         />
//       </div>
//     </>

//     <>
//       <Link className="btn btn-primary mr-1" to="/signup">
//         Signup
//       </Link>
//       <Link className="btn" to="/login">
//         Login
//       </Link>
//     </>
//   </div>
