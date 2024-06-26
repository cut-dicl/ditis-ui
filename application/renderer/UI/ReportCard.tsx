const ReportCard = ({ children }) => {
  return (
    <div className="flex justify-center min-h-[350px] flex-wrap gap-5 w-full">
      {children}
    </div>
  );
};

export default ReportCard;
