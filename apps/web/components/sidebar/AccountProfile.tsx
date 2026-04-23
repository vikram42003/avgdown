const AccountProfile = () => {
  return (
    <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer">
      {/* Avatar placeholder */}
      <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
        <span className="text-xs font-semibold text-primary">VI</span>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium truncate">Vikram</span>
        <span className="text-xs text-muted-foreground truncate">vikram@example.com</span>
      </div>
    </div>
  );
};

export default AccountProfile;