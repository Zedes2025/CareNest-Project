interface NotificationCardProps {
  username: string;
  avatarUrl: string;
}

export const NotificationCard = ({ username, avatarUrl }: NotificationCardProps) => {
  console.log(avatarUrl);
  return (
    <div className="card w-96 bg-base-100 shadow border mb-4">
      <div className="card-body p-4">
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-14 rounded-full">
              <img src={avatarUrl} alt={username} />
            </div>
          </div>

          <div>
            <h2 className="font-semibold">{username}</h2>
            <p className="text-sm text-gray-500">wants to connect with you</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button className="btn btn-sm btn-neutral rounded-xl">Accept</button>

          <button className="btn btn-sm btn-outline rounded-xl">Decline</button>
        </div>
      </div>
    </div>
  );
};
