const ReportCard = ({ children }) => {
  return (
    <div
      className="flex justify-between min-h-[350px]"
    >
      {children}
    </div>
  );
};

export default ReportCard;
