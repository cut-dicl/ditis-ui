const ReportItemCard = ({ key, children, width }) => {
  return (
    <div
      key={key}
      style={{
        width: width,
        background: "#f0f0f0",
        borderRadius: "8px",
        padding: "16px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
      }}
    >
      {children}
    </div>
  );
};

export default ReportItemCard;
