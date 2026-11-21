pub mod eink;

#[cfg(any(target_os = "android", test))]
pub mod bootstrap;

pub use eink::is_eink_device;
