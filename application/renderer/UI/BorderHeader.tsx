const BorderHeader = ({ children, className = "", ...props }) => {
  return (
    <h1
      className={
        `text-xl font-bold text-black mb-3 w-fit p-2 rounded-xl bg-gray-100 border border-black ` +
        className
      }
      style={{
        fontFamily: "Montserrat, sans-serif",
      }}
      {...props}
    >
      {children}
    </h1>
  );
};

export default BorderHeader;
