use axum::{
    routing::{get, post},
    Router, Json, extract::Form,
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::{CorsLayer, Any};
use tracing_subscriber;

#[derive(Deserialize)]
struct ArchiveRequest {
    url: String,
    timestamp: Option<String>,
}

#[derive(Serialize)]
struct ArchiveResponse {
    success: bool,
    data: Option<ArchiveResult>,
    error: Option<String>,
}

#[derive(Serialize)]
struct ArchiveResult {
    original_url: String,
    archived_url: String,
    timestamp: String,
    title: String,
    status: String,
}

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
    version: String,
}

async fn health_check() -> impl IntoResponse {
    Json(HealthResponse {
        status: "healthy".to_string(),
        service: "Web Archive Access".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

async fn root() -> impl IntoResponse {
    Json(serde_json::json!({
        "service": "Web Archive Access",
        "version": env!("CARGO_PKG_VERSION"),
        "endpoints": {
            "POST /archive": "Archive a webpage",
            "GET /archive/:url": "Get archived version",
            "GET /health": "Health check"
        }
    }))
}

async fn archive_page(
    Form(req): Form<ArchiveRequest>,
) -> impl IntoResponse {
    let timestamp = req.timestamp.unwrap_or_else(|| {
        chrono::Utc::now().format("%Y%m%d%H%M%S").to_string()
    });

    let result = ArchiveResult {
        original_url: req.url.clone(),
        archived_url: format!("https://web.archive.org/web/{}/{}", timestamp, req.url),
        timestamp,
        title: "Archived Page".to_string(),
        status: "archived".to_string(),
    };

    Json(ArchiveResponse {
        success: true,
        data: Some(result),
        error: None,
    })
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health_check))
        .route("/archive", post(archive_page))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001")
        .await
        .unwrap();

    tracing::info!("Web Archive Access backend running on port 3001");
    axum::serve(listener, app).await.unwrap();
}
