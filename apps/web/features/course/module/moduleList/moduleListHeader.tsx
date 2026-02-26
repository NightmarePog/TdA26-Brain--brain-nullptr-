interface ModuleListHeaderProps {
  children: string;
}

const ModuleListHeader = ({ children }: ModuleListHeaderProps) => {
  return (
    <div className="bg-primary p-5 first:rounded-t-2xl last:border-b-2xl">
      <h2 className="font-bold text-3xl text-white">{children}</h2>
    </div>
  );
};

export default ModuleListHeader;
