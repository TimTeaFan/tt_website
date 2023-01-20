use_tt_post <- function (slug, site = ".", open = rlang::is_interactive())
{
  hugodown:::check_slug(slug)
  post_slug <- paste0("post/", tolower(slug))
  data <- list(pleased = hugodown:::tidy_pleased())
  pieces <- strsplit(slug, "-")[[1]]
  if (rlang::is_installed(pieces[[1]])) {
    data$package <- pieces[[1]]
    data$version <- utils::packageVersion(pieces[[1]])
  }
  hugodown::use_post(post_slug, data = data, site = site, open = open)
}
