import java.sql.*;
import java.util.Properties;
public class TestConn {
    public static void main(String[] args) throws Exception {
        Properties props = new Properties();
        props.setProperty("user", "postgres.yesykibnglunqlspikin");
        props.setProperty("password", "MSK&7%BX3FfSjN6");
        props.setProperty("sslmode", "require");
        String url = "jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";
        System.out.println("Connecting to: " + url);
        Class.forName("org.postgresql.Driver");
        try (Connection conn = DriverManager.getConnection(url, props)) {
            System.out.println("SUCCESS! DB: " + conn.getMetaData().getDatabaseProductVersion());
        }
    }
}
