const ReportItemCard = ({ key, children, style = {}, ...props }) => {
  const combinedStyle = {
    borderRadius: "8px",
    padding: "10px",
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderWidth: "2px",
    ...style,
  };

  return (
    <div key={key} style={combinedStyle} className="dark:text-white" {...props}>
      {children}
    </div>
  );
};

export default ReportItemCard;
