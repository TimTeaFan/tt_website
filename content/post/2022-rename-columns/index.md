---
output:
  hugodown::md_document:
    toc: TRUE
# Documentation: https://sourcethemes.com/academic/docs/managing-content/

title: "Partially renaming columns using a lookup table"
subtitle: ""
summary: "This blog post shows how to partially rename columns with a lookup table using four different approaches: base R, data.table, dplyr, and pandas."
authors: []
tags: ["R", "Python"]
categories: ["R", "Python"]
date: 2022-12-23
lastmod: 2022-12-23
featured: false
draft: false

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder.
# Focal points: Smart, Center, TopLeft, Top, TopRight, Left, Right, BottomLeft, Bottom, BottomRight.
image:
  caption: ""
  focal_point: ""
  preview_only: false

# Projects (optional).
#   Associate this post with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `projects = ["internal-project"]` references `content/project/deep-learning/index.md`.
#   Otherwise, set `projects = []`.
projects: []
rmd_hash: b61ef87187a12378

---

-   <a href="#intro" id="toc-intro">Intro</a>
-   <a href="#setup" id="toc-setup">Setup</a>
-   <a href="#base-r" id="toc-base-r">base R</a>
-   <a href="#data.table" id="toc-data.table">data.table</a>
-   <a href="#dplyr-tidyverse" id="toc-dplyr-tidyverse">dplyr (tidyverse)</a>
-   <a href="#python-pandas" id="toc-python-pandas">Python pandas</a>

## Intro

Usually data sets come with short column names, which makes it easy to clean and manipulate the data. However, when presenting the data to stakeholders, in form of tables or plots, we often need longer, meaningful names. In many cases we have a lookup table which contains long and short versions of the column names so that we can "easily" replace the names when needed.

Below we'll look at how to rename columns using different approaches in R. To make this a little bit more challenging, we'll add three conditions:

1.  The lookup table is not complete, that means the lookup table only covers a subset of the columns in our data set.
2.  We are working with a subset of the original data, that means, the lookup table, although being not complete, holds actually *more* column name pairs than there are actually columns in the subset of our data.
3.  The sorting of the lookup table is different from the sorting of our actual column names.

Without those three conditions partially renaming columns is actually not a big deal. In real world settings however, there are definitely cases where we have to rename columns under one or more of the above conditions.

It is interesting to see how the three large paradigms in R, base R, 'data.table' and 'dplyr' compare in handling this problem.

This post concludes by looking at how we would tackle the same problem in Python's 'pandas' library.

Let's start with the setup.

## Setup

We take the `mtcars` data set and create lookup `data.frame` called `recode_df` based on the information from the documentation [`?mtcars`](https://rdrr.io/r/datasets/mtcars.html). Next, we apply the three conditions mentioned above (see code comments) and assign this new data to `mycars`.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>recode_df</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/data.frame.html'>data.frame</a></span><span class='o'>(</span></span>
<span>  old <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/names.html'>names</a></span><span class='o'>(</span><span class='nv'>mtcars</span><span class='o'>)</span>,</span>
<span>  new <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"Miles per galon"</span>, <span class='s'>"Number of cylinders"</span>, <span class='s'>"Displacement (cu.in.)"</span>,</span>
<span>          <span class='s'>"Gross horsepower"</span>,<span class='s'>"Rear axle ratio"</span>, <span class='s'>"Weight (1000 lbs)"</span>, </span>
<span>          <span class='s'>"1/4 mile time"</span>, <span class='s'>"Engine (0=automatic, 1=manual)"</span>,</span>
<span>          <span class='s'>"Number of forward gears"</span>, <span class='s'>"Transmission (0=automatic, 1=manual)"</span>,</span>
<span>          <span class='s'>"Number of carbuertors"</span><span class='o'>)</span></span>
<span>  <span class='o'>)</span></span>
<span></span>
<span><span class='c'># condition 3: The lookup table has a different sorting than the actual column names</span></span>
<span><span class='c'># Here we choose a alphabetical ordering for the lookup table:</span></span>
<span><span class='nv'>recode_df</span> <span class='o'>&lt;-</span> <span class='nv'>recode_df</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>recode_df</span><span class='o'>$</span><span class='nv'>old</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span><span class='nf'><a href='https://rdrr.io/r/base/colnames.html'>rownames</a></span><span class='o'>(</span><span class='nv'>recode_df</span><span class='o'>)</span> <span class='o'>&lt;-</span> <span class='kc'>NULL</span></span>
<span></span>
<span><span class='c'># condition 2: we are only working with a subset of the data</span></span>
<span><span class='c'># Here we only use every second column:</span></span>
<span><span class='nv'>every_2nd_col</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/seq.html'>seq</a></span><span class='o'>(</span>from <span class='o'>=</span> <span class='m'>1</span>, to <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/length.html'>length</a></span><span class='o'>(</span><span class='nv'>mtcars</span><span class='o'>)</span>, by <span class='o'>=</span> <span class='m'>2</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>mycars</span> <span class='o'>&lt;-</span> <span class='nv'>mtcars</span><span class='o'>[</span>,<span class='nv'>every_2nd_col</span><span class='o'>]</span></span>
<span></span>
<span><span class='c'># condition 1: the data has a column that is not part of the lookup table</span></span>
<span><span class='c'># Here we take the rownames and put them in a dedicated column `model` ...</span></span>
<span><span class='c'># ... which is no included in `recode_df`</span></span>
<span><span class='nv'>mycars</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/cbind.html'>cbind</a></span><span class='o'>(</span>model <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/colnames.html'>rownames</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>)</span>,</span>
<span>                <span class='nf'><a href='https://rdrr.io/r/base/data.frame.html'>data.frame</a></span><span class='o'>(</span><span class='nv'>mycars</span>, row.names <span class='o'>=</span> <span class='kc'>NULL</span><span class='o'>)</span><span class='o'>)</span></span>
<span></span>
<span><span class='nf'><a href='https://rdrr.io/r/utils/str.html'>str</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; 'data.frame':  32 obs. of  7 variables:</span></span>
<span><span class='c'>#&gt;  $ model: chr  "Mazda RX4" "Mazda RX4 Wag" "Datsun 710" "Hornet 4 Drive" ...</span></span>
<span><span class='c'>#&gt;  $ mpg  : num  21 21 22.8 21.4 18.7 18.1 14.3 24.4 22.8 19.2 ...</span></span>
<span><span class='c'>#&gt;  $ disp : num  160 160 108 258 360 ...</span></span>
<span><span class='c'>#&gt;  $ drat : num  3.9 3.9 3.85 3.08 3.15 2.76 3.21 3.69 3.92 3.92 ...</span></span>
<span><span class='c'>#&gt;  $ qsec : num  16.5 17 18.6 19.4 17 ...</span></span>
<span><span class='c'>#&gt;  $ am   : num  1 1 1 0 0 0 0 0 0 0 ...</span></span>
<span><span class='c'>#&gt;  $ carb : num  4 4 1 1 2 1 4 2 2 4 ...</span></span>
<span></span></code></pre>

</div>

As as final step lets write both data.frame's `mycars` and `recode_df` from R to two separate csv files, so that we can load them easily into Python later on. (In RMarkdown we could of course access the objects created in R from Python via the `r` object, but lets stick to csv files to make this reproducible for all users.)

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nf'><a href='https://rdrr.io/r/utils/write.table.html'>write.csv</a></span><span class='o'>(</span><span class='nv'>mycars</span>, <span class='s'>"mycars.csv"</span><span class='o'>)</span></span>
<span><span class='nf'><a href='https://rdrr.io/r/utils/write.table.html'>write.csv</a></span><span class='o'>(</span><span class='nv'>recode_df</span>, <span class='s'>"recode_df.csv"</span><span class='o'>)</span></span></code></pre>

</div>

## base R

Lets start with base R. If it weren't for the three conditions outlined above, renaming columns in base R would be really easy. It would basically boil down to a classic lookup using [`match()`](https://rdrr.io/r/base/match.html) as index to extract `[` the new names:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>recode_df</span><span class='o'>$</span><span class='nv'>new</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/match.html'>match</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/base/names.html'>names</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>)</span>, <span class='nv'>recode_df</span><span class='o'>$</span><span class='nv'>old</span><span class='o'>)</span><span class='o'>]</span></span>
<span><span class='c'>#&gt; [1] NA                        "Miles per galon"        </span></span>
<span><span class='c'>#&gt; [3] "Displacement (cu.in.)"   "Rear axle ratio"        </span></span>
<span><span class='c'>#&gt; [5] "1/4 mile time"           "Number of forward gears"</span></span>
<span><span class='c'>#&gt; [7] "Number of carbuertors"</span></span>
<span></span></code></pre>

</div>

But as we can see, this creates an `NA` for the column name that is not included in the lookup table `model`.

This leaves use with two options. Extract only those new column names `recode_df$new` for which we have recodes `recodes_nms`. We then replace only those names in our data.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># create a new object so that we don't overwrite our original `mycars` data</span></span>
<span><span class='nv'>mycars_base</span> <span class='o'>&lt;-</span> <span class='nv'>mycars</span></span>
<span></span>
<span><span class='c'># get the column names of our data</span></span>
<span><span class='nv'>mycars_cols</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/names.html'>names</a></span><span class='o'>(</span><span class='nv'>mycars_base</span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># find the column names for which we do have updated column names</span></span>
<span><span class='nv'>recode_nms</span> <span class='o'>&lt;-</span> <span class='nv'>mycars_cols</span><span class='o'>[</span><span class='nv'>mycars_cols</span> <span class='o'><a href='https://rdrr.io/r/base/match.html'>%in%</a></span> <span class='nv'>recode_df</span><span class='o'>$</span><span class='nv'>old</span><span class='o'>]</span></span>
<span></span>
<span><span class='c'># get the new names by extracting `[` with `match()`</span></span>
<span><span class='nv'>new_nms</span> <span class='o'>&lt;-</span> <span class='nv'>recode_df</span><span class='o'>$</span><span class='nv'>new</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/match.html'>match</a></span><span class='o'>(</span><span class='nv'>recode_nms</span>, <span class='nv'>recode_df</span><span class='o'>$</span><span class='nv'>old</span><span class='o'>)</span><span class='o'>]</span></span>
<span></span>
<span><span class='c'># Replace column names for which we have recodes with our new column names</span></span>
<span><span class='nf'><a href='https://rdrr.io/r/base/names.html'>names</a></span><span class='o'>(</span><span class='nv'>mycars_base</span><span class='o'>)</span><span class='o'>[</span><span class='nv'>mycars_cols</span> <span class='o'><a href='https://rdrr.io/r/base/match.html'>%in%</a></span> <span class='nv'>recode_nms</span><span class='o'>]</span> <span class='o'>&lt;-</span> <span class='nv'>new_nms</span></span>
<span></span>
<span><span class='c'># use `str()` for better printing</span></span>
<span><span class='nf'><a href='https://rdrr.io/r/utils/str.html'>str</a></span><span class='o'>(</span><span class='nv'>mycars_base</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; 'data.frame':  32 obs. of  7 variables:</span></span>
<span><span class='c'>#&gt;  $ model                  : chr  "Mazda RX4" "Mazda RX4 Wag" "Datsun 710" "Hornet 4 Drive" ...</span></span>
<span><span class='c'>#&gt;  $ Miles per galon        : num  21 21 22.8 21.4 18.7 18.1 14.3 24.4 22.8 19.2 ...</span></span>
<span><span class='c'>#&gt;  $ Displacement (cu.in.)  : num  160 160 108 258 360 ...</span></span>
<span><span class='c'>#&gt;  $ Rear axle ratio        : num  3.9 3.9 3.85 3.08 3.15 2.76 3.21 3.69 3.92 3.92 ...</span></span>
<span><span class='c'>#&gt;  $ 1/4 mile time          : num  16.5 17 18.6 19.4 17 ...</span></span>
<span><span class='c'>#&gt;  $ Number of forward gears: num  1 1 1 0 0 0 0 0 0 0 ...</span></span>
<span><span class='c'>#&gt;  $ Number of carbuertors  : num  4 4 1 1 2 1 4 2 2 4 ...</span></span>
<span></span></code></pre>

</div>

The approach above is somewhat verbose, but it makes it easier to see each single step. It could be rewritten in one or two cryptic lines, but we wouldn't gain much from that.

The other option to stick to the original [`match()`](https://rdrr.io/r/base/match.html) extract `[` approach and [`replace()`](https://rdrr.io/r/base/replace.html) the `NA`s with the column names that don't change for which we need an index, below `idx_na`:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># create a new object so that we don't overwrite our original `mycars` data</span></span>
<span><span class='nv'>mycars_base</span> <span class='o'>&lt;-</span> <span class='nv'>mycars</span></span>
<span></span>
<span><span class='c'># get the column names of our data</span></span>
<span><span class='nv'>mycars_cols</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/names.html'>names</a></span><span class='o'>(</span><span class='nv'>mycars_base</span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># use original `match()` extract `[` approach </span></span>
<span><span class='nv'>new_nms</span> <span class='o'>&lt;-</span> <span class='nv'>recode_df</span><span class='o'>$</span><span class='nv'>new</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/match.html'>match</a></span><span class='o'>(</span><span class='nv'>mycars_cols</span>, <span class='nv'>recode_df</span><span class='o'>$</span><span class='nv'>old</span><span class='o'>)</span><span class='o'>]</span></span>
<span></span>
<span><span class='c'># Get index of `NA`s</span></span>
<span><span class='nv'>idx_na</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/NA.html'>is.na</a></span><span class='o'>(</span><span class='nv'>new_nms</span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># replace `NA`s in new_nms with original names in mycars</span></span>
<span><span class='nv'>new_nms_all</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/replace.html'>replace</a></span><span class='o'>(</span><span class='nv'>new_nms</span>, <span class='c'># vector in which we want to replace values</span></span>
<span>                       <span class='nv'>idx_na</span>,  <span class='c'># index of values to replace</span></span>
<span>                       <span class='nv'>mycars_cols</span><span class='o'>[</span><span class='nv'>idx_na</span><span class='o'>]</span><span class='o'>)</span> <span class='c'># values to fill in</span></span>
<span></span>
<span><span class='nf'><a href='https://rdrr.io/r/base/names.html'>names</a></span><span class='o'>(</span><span class='nv'>mycars_base</span><span class='o'>)</span> <span class='o'>&lt;-</span> <span class='nv'>new_nms_all</span></span>
<span></span>
<span><span class='c'># use `str()` for better printing</span></span>
<span><span class='nf'><a href='https://rdrr.io/r/utils/str.html'>str</a></span><span class='o'>(</span><span class='nv'>mycars_base</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; 'data.frame':  32 obs. of  7 variables:</span></span>
<span><span class='c'>#&gt;  $ model                  : chr  "Mazda RX4" "Mazda RX4 Wag" "Datsun 710" "Hornet 4 Drive" ...</span></span>
<span><span class='c'>#&gt;  $ Miles per galon        : num  21 21 22.8 21.4 18.7 18.1 14.3 24.4 22.8 19.2 ...</span></span>
<span><span class='c'>#&gt;  $ Displacement (cu.in.)  : num  160 160 108 258 360 ...</span></span>
<span><span class='c'>#&gt;  $ Rear axle ratio        : num  3.9 3.9 3.85 3.08 3.15 2.76 3.21 3.69 3.92 3.92 ...</span></span>
<span><span class='c'>#&gt;  $ 1/4 mile time          : num  16.5 17 18.6 19.4 17 ...</span></span>
<span><span class='c'>#&gt;  $ Number of forward gears: num  1 1 1 0 0 0 0 0 0 0 ...</span></span>
<span><span class='c'>#&gt;  $ Number of carbuertors  : num  4 4 1 1 2 1 4 2 2 4 ...</span></span>
<span></span></code></pre>

</div>

Both cases are somewhat verbose and cumbersome, so lets have a look how we can tackle this problem using 'data.table' and 'dplyr'.

## data.table

The 'data.table' package sometimes has the reputation for offering a crypting, arcane syntax, but many users don't know that the package also contains many helpful functions which are pretty straight-forward to use. In our case we can apply [`data.table::setnames()`](https://Rdatatable.gitlab.io/data.table/reference/setattr.html) out of the box. It takes a `data.table`, a vector of old and new column names and finally all we have to do is to set the `skip_absent` argument to `TRUE`, to prevent 'data.table' from raising an error, since not all of the names in our lookup table are present in the data.

Unlike base R, the names are changed "by reference", meaning that we don't need to assign the result to a new variable, since no copy is made. Instead the data is "modified in place".

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://r-datatable.com'>data.table</a></span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>mycars_dt</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/as.data.table.html'>as.data.table</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>)</span></span>
<span></span>
<span><span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/setattr.html'>setnames</a></span><span class='o'>(</span><span class='nv'>mycars_dt</span>,</span>
<span>         old <span class='o'>=</span> <span class='nv'>recode_df</span><span class='o'>$</span><span class='nv'>old</span>,</span>
<span>         new <span class='o'>=</span> <span class='nv'>recode_df</span><span class='o'>$</span><span class='nv'>new</span>,</span>
<span>         skip_absent <span class='o'>=</span> <span class='kc'>TRUE</span><span class='o'>)</span></span>
<span></span>
<span><span class='nf'><a href='https://rdrr.io/r/utils/str.html'>str</a></span><span class='o'>(</span><span class='nv'>mycars_dt</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; Classes 'data.table' and 'data.frame':  32 obs. of  7 variables:</span></span>
<span><span class='c'>#&gt;  $ model                  : chr  "Mazda RX4" "Mazda RX4 Wag" "Datsun 710" "Hornet 4 Drive" ...</span></span>
<span><span class='c'>#&gt;  $ Miles per galon        : num  21 21 22.8 21.4 18.7 18.1 14.3 24.4 22.8 19.2 ...</span></span>
<span><span class='c'>#&gt;  $ Displacement (cu.in.)  : num  160 160 108 258 360 ...</span></span>
<span><span class='c'>#&gt;  $ Rear axle ratio        : num  3.9 3.9 3.85 3.08 3.15 2.76 3.21 3.69 3.92 3.92 ...</span></span>
<span><span class='c'>#&gt;  $ 1/4 mile time          : num  16.5 17 18.6 19.4 17 ...</span></span>
<span><span class='c'>#&gt;  $ Number of forward gears: num  1 1 1 0 0 0 0 0 0 0 ...</span></span>
<span><span class='c'>#&gt;  $ Number of carbuertors  : num  4 4 1 1 2 1 4 2 2 4 ...</span></span>
<span><span class='c'>#&gt;  - attr(*, ".internal.selfref")=&lt;externalptr&gt;</span></span>
<span></span></code></pre>

</div>

## dplyr (tidyverse)

Renaming columns in 'dplyr' is as easy as `df %>% rename("new_name" = "old_name")`. At least when we use [`dplyr::rename()`](https://dplyr.tidyverse.org/reference/rename.html) interactively and type in each old and new name manually. Usually when working programmatically with 'dplyr' we supply a named vector to functions that take the ellipsis `...` as argument, like [`rename()`](https://dplyr.tidyverse.org/reference/rename.html), and splice it in using the bang-bang-bang operator `!!!`.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://dplyr.tidyverse.org'>dplyr</a></span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># create a named vector</span></span>
<span><span class='nv'>recode_vec</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/stats/setNames.html'>setNames</a></span><span class='o'>(</span><span class='nv'>recode_df</span><span class='o'>$</span><span class='nv'>old</span>, <span class='nv'>recode_df</span><span class='o'>$</span><span class='nv'>new</span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># splice it in with `!!!`</span></span>
<span><span class='nv'>mycars</span> <span class='o'><a href='https://magrittr.tidyverse.org/reference/pipe.html'>%&gt;%</a></span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/rename.html'>rename</a></span><span class='o'>(</span><span class='o'>!</span><span class='o'>!</span><span class='o'>!</span> <span class='nv'>recode_vec</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; <span style='color: #BBBB00; font-weight: bold;'>Error</span><span style='font-weight: bold;'> in `rename()`:</span></span></span>
<span><span class='c'>#&gt; <span style='color: #BBBB00;'>!</span> Can't rename columns that don't exist.</span></span>
<span><span class='c'>#&gt; <span style='color: #BB0000;'>✖</span> Column `cyl` doesn't exist.</span></span>
<span></span></code></pre>

</div>

However, this won't work in our case, since our lookup table, and the named vector that we constructed with it, contains column name pairs that don't exist in our data, which leads to the above error.

Intuitively, one want's fall back to the base R approach where we extract only those names from our named vector that our data actually contains:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># extract column name pairs that are actually in our data and splice into `rename()`</span></span>
<span><span class='nv'>mycars</span> <span class='o'><a href='https://magrittr.tidyverse.org/reference/pipe.html'>%&gt;%</a></span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/rename.html'>rename</a></span><span class='o'>(</span><span class='o'>!</span><span class='o'>!</span><span class='o'>!</span> <span class='nv'>recode_vec</span><span class='o'>[</span><span class='nv'>recode_vec</span> <span class='o'><a href='https://rdrr.io/r/base/match.html'>%in%</a></span> <span class='nf'><a href='https://rdrr.io/r/base/names.html'>names</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>)</span><span class='o'>]</span><span class='o'>)</span> <span class='o'><a href='https://magrittr.tidyverse.org/reference/pipe.html'>%&gt;%</a></span> </span>
<span>  <span class='nf'><a href='https://pillar.r-lib.org/reference/glimpse.html'>glimpse</a></span><span class='o'>(</span><span class='o'>)</span> <span class='c'># for better printing</span></span>
<span><span class='c'>#&gt; Rows: 32</span></span>
<span><span class='c'>#&gt; Columns: 7</span></span>
<span><span class='c'>#&gt; $ model                     <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span> "Mazda RX4", "Mazda RX4 Wag", "Datsun 710", …</span></span>
<span><span class='c'>#&gt; $ `Miles per galon`         <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> 21.0, 21.0, 22.8, 21.4, 18.7, 18.1, 14.3, 24…</span></span>
<span><span class='c'>#&gt; $ `Displacement (cu.in.)`   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> 160.0, 160.0, 108.0, 258.0, 360.0, 225.0, 36…</span></span>
<span><span class='c'>#&gt; $ `Rear axle ratio`         <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> 3.90, 3.90, 3.85, 3.08, 3.15, 2.76, 3.21, 3.…</span></span>
<span><span class='c'>#&gt; $ `1/4 mile time`           <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> 16.46, 17.02, 18.61, 19.44, 17.02, 20.22, 15…</span></span>
<span><span class='c'>#&gt; $ `Number of forward gears` <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,…</span></span>
<span><span class='c'>#&gt; $ `Number of carbuertors`   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> 4, 4, 1, 1, 2, 1, 4, 2, 2, 4, 4, 3, 3, 3, 4,…</span></span>
<span></span></code></pre>

</div>

And although this works, it is not as easy and clean as we expect. However, there is an even easier way in 'dplyr' which doesn't come with the need of neither splicing nor extracting: [`dplyr::any_of()`](https://tidyselect.r-lib.org/reference/all_of.html).

Usually [`any_of()`](https://tidyselect.r-lib.org/reference/all_of.html) takes a character vector with column names and is used inside [`dplyr::select()`](https://dplyr.tidyverse.org/reference/select.html) to select "any of" the columns in the vector. It won't throw an error when any of the column names is not actually in our data.

The cool, and undocumented feature is that we can use [`any_of()`](https://tidyselect.r-lib.org/reference/all_of.html) inside [`rename()`](https://dplyr.tidyverse.org/reference/rename.html) and that we can supply it a named vector to do the renaming for us:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># first lets create new object</span></span>
<span><span class='c'># ... so that we don't overwrite our original `mycars` data</span></span>
<span><span class='nv'>mycars_tidy</span> <span class='o'>&lt;-</span> <span class='nv'>mycars</span></span>
<span></span>
<span><span class='c'># here we construct the same named vector as above</span></span>
<span><span class='nv'>recode_vec</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/stats/setNames.html'>setNames</a></span><span class='o'>(</span><span class='nv'>recode_df</span><span class='o'>$</span><span class='nv'>old</span>, <span class='nv'>recode_df</span><span class='o'>$</span><span class='nv'>new</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>mycars_tidy</span> <span class='o'>&lt;-</span> <span class='nv'>mycars_tidy</span> <span class='o'><a href='https://magrittr.tidyverse.org/reference/pipe.html'>%&gt;%</a></span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/rename.html'>rename</a></span><span class='o'>(</span><span class='nf'><a href='https://tidyselect.r-lib.org/reference/all_of.html'>any_of</a></span><span class='o'>(</span><span class='nv'>recode_vec</span><span class='o'>)</span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># use `glimpse()` for better printing</span></span>
<span><span class='nv'>mycars_tidy</span> <span class='o'><a href='https://magrittr.tidyverse.org/reference/pipe.html'>%&gt;%</a></span></span>
<span>  <span class='nf'><a href='https://pillar.r-lib.org/reference/glimpse.html'>glimpse</a></span><span class='o'>(</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; Rows: 32</span></span>
<span><span class='c'>#&gt; Columns: 7</span></span>
<span><span class='c'>#&gt; $ model                     <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span> "Mazda RX4", "Mazda RX4 Wag", "Datsun 710", …</span></span>
<span><span class='c'>#&gt; $ `Miles per galon`         <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> 21.0, 21.0, 22.8, 21.4, 18.7, 18.1, 14.3, 24…</span></span>
<span><span class='c'>#&gt; $ `Displacement (cu.in.)`   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> 160.0, 160.0, 108.0, 258.0, 360.0, 225.0, 36…</span></span>
<span><span class='c'>#&gt; $ `Rear axle ratio`         <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> 3.90, 3.90, 3.85, 3.08, 3.15, 2.76, 3.21, 3.…</span></span>
<span><span class='c'>#&gt; $ `1/4 mile time`           <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> 16.46, 17.02, 18.61, 19.44, 17.02, 20.22, 15…</span></span>
<span><span class='c'>#&gt; $ `Number of forward gears` <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,…</span></span>
<span><span class='c'>#&gt; $ `Number of carbuertors`   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> 4, 4, 1, 1, 2, 1, 4, 2, 2, 4, 4, 3, 3, 3, 4,…</span></span>
<span></span></code></pre>

</div>

The good thing about both approaches in 'data.table' and 'dplyr' is that we can deliberately ignore errors when not all of the column name pairs are present in our data. Either by setting [`data.table::setnames()`](https://Rdatatable.gitlab.io/data.table/reference/setattr.html)'s `skip_absent` argument to `TRUE` or by using [`tidyselect::any_of()`](https://tidyselect.r-lib.org/reference/all_of.html). Which means we can also raise errors if we need them: setting `skip_absent` to `FALSE` or using [`tidyselect::all_of()`](https://tidyselect.r-lib.org/reference/all_of.html) (which is the opposite of [`any_of()`](https://tidyselect.r-lib.org/reference/all_of.html) and requires all column names to be present in the data).

Finally, lets have a look at how we would solve this problem in Python's 'pandas' library.

## Python pandas

In Python we can use 'pandas's [`pd.DataFrame.rename`](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.rename.html) function to rename columns of a `DataFrame`. The only thing we need to take care of is supplying the `columns` argument with a dictionary of column name pairs `{"old" : "new"}`. There are several ways to create a dictionary from our `recode_df`. Below we use a pandas approach with `set_index(...).to_dict()`, but we could also have used Pythons `dict(zip())` functions.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'>import pandas as pd

# setup
mycars = pd.read_csv("mycars.csv", index_col = 0)
recode_df = pd.read_csv("recode_df.csv",  index_col = 0)

# Create dictionary from `recode_df`
recode_dic = recode_df.set_index('old')['new'].to_dict()
# Alternatively: dict(zip(recode_df['old'], recode_df['new']))

# Rename columns
(mycars
  .rename(
     columns=recode_dic,
     inplace=True
     )
 )

mycars.info()

#> <class 'pandas.core.frame.DataFrame'>
#> Int64Index: 32 entries, 1 to 32
#> Data columns (total 7 columns):
#>  #   Column                   Non-Null Count  Dtype  
#> ---  ------                   --------------  -----  
#>  0   model                    32 non-null     object 
#>  1   Miles per galon          32 non-null     float64
#>  2   Displacement (cu.in.)    32 non-null     float64
#>  3   Rear axle ratio          32 non-null     float64
#>  4   1/4 mile time            32 non-null     float64
#>  5   Number of forward gears  32 non-null     int64  
#>  6   Number of carbuertors    32 non-null     int64  
#> dtypes: float64(4), int64(2), object(1)
#> memory usage: 2.0+ KB
</code></pre>

</div>

When it comes to renaming columns, we can see that 'pandas' is pretty similar to 'dplyr', even more so when we write our Python code according to the <a href="https://store.metasnake.com/effective-pandas-book" role="highlight"> Effective Pandas"</a> style. However, it also resembles 'data.table' in two aspects. First, when setting the `inplace` argument to `True` the `DataFrame` is modified in place, no copy is made, and we don't need to assign the result back to a variable. Second, `rename` has an argument `errors` which is set to `'ignore'` by default. If we want pandas to throw an error if not all columns are present in our data, we can set it to `'raise'`.

That's it. I hope you enjoyed reading about renaming columns in R and Python. If you have a better way of renaming columns (especially in base R) let me know via Twitter, Mastadon or Github.

