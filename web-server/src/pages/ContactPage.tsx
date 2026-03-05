//Placeholder so there is no whitepage

export const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      <h2 className="text-lg font-semibold mt-4 mb-4">Pending requests</h2>

      <div className="card w-96 bg-base-100 card-xs shadow-sm border">
        <div className="card-body  ">
          <h2 className="card-title justify-center">Username</h2>
          <div className="flex row">
            <div className="avatar">
              <div className="w-24 rounded-full">
                <img src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" />
              </div>
            </div>

            <p>username wants to connect with you!</p>
          </div>
          <div className="justify-end card-actions">
            <button className="btn btn-sm btn-neutral rounded-xl">
              Accept
            </button>
            <button className="btn btn-sm  rounded-xl">Decline</button>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-4 mb-4">Previous Responses</h2>
    </div>
  );
};
