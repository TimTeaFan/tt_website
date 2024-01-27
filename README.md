
<!-- README.md is generated from README.Rmd. Please edit that file -->

# tt_website

<!-- badges: start -->

[![Netlify
Status](https://api.netlify.com/api/v1/badges/8d6c58a6-10a3-46d9-b2d1-e4123ecdb2c5/deploy-status)](https://app.netlify.com/sites/timteafan/deploys)
<!-- badges: end -->

## Welcome

<p id="logop">
<a id="logo" href="https://raw.githubusercontent.com/TimTeaFan/tt_website/main/logo.png"><img src="https://raw.githubusercontent.com/TimTeaFan/tt_website/main/logo.png" alt="website's logo showing the letter T two times" align="right" width=260></a>
</p>

Welcome to the project README of my personal website which you can find
under <https://tim-tiefenbach.de>.

This website was created using several tools. The core is build on Hugo
and an older version of the Academic Theme. This basic setup renders
markdown files as HTML. Further, the R package
[hugodown](https://hugodown.r-lib.org) is used to convert Rmarkdown to
markdown files, which powers the blog posts. The web deployment is done
via Netlify.

## Add-ons and Tweaks

This websites contains a bunch of add-ons and tweaks which did cost me
some time to figure out. Feel free to browse through the code and
settings to see what I have changed. If you are interested in specific
features you like about this website, feel free to reach out to me on
[X](https://twitter.com/timteafan) or
[Mastodon](https://fosstodon.org/@TimTeaFan).

Here is a non-exhaustive list of features which set this website apart
from the basic academic theme:

1.  Mastadon integration<br>- in the social links of the “About” page
    and “author card”<br> - in the share links below posts as link to
    <https://toot.kytta.dev/> for cross posting
2.  Custom column headings in the “About” widget<br>“Education” is
    replaced with “Work & Education” (see [this
    post](https://stackoverflow.com/a/63074154/9349302) on how to do it)
3.  A cookie consent with custom CSS
4.  A Legal Notice and Privacy Policy (in English and German)
5.  Adding a GitHub icon to the navbar (which wasn’t originally
    supported)
6.  Getting rid of the Google font dependency<br>as described in [this
    post](https://www.chrislockard.net/posts/using-local-fonts-hugo-academic-theme/)
7.  Adding favicons (hopefully displayed on most devices)
8.  Adding a social preview (for most apps & services)
9.  Changing Twitter Icons to X and updating to the latest Fontawesome
    verison.
