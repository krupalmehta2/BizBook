const Footer = () => {
  return (
    <footer style={styles.footer}>
      <h2 style={styles.title}>BizBook</h2>
      <p style={styles.subtitle}>🌍 Vocal for Local – Empowering Small Businesses</p>
      <p style={styles.credit}>
        Created by <span style={styles.brand}>A2Z Clicks</span>
      </p>
    </footer>
  );
};

const styles = {
  footer: {
    background: "#2c3e50",
    color: "#ecf0f1",
    padding: "30px 15px",
    textAlign: "center",
    marginTop: "50px",
  },
  title: { margin: "0 0 8px", fontSize: "22px" },
  subtitle: { margin: "0 0 6px", fontSize: "14px", color: "#bdc3c7" },
  credit: { fontSize: "13px", marginTop: "8px", color: "#95a5a6" },
  brand: { color: "#f39c12", fontWeight: "bold" },
};

export default Footer;
