---
output:
  hugodown::md_document:
    includes:
      after_body: ./../../../static/rmdtemp/wrap_info_box.html
    toc: TRUE
# Documentation: https://sourcethemes.com/academic/docs/managing-content/

title: "Basic and advanced odering operations"
subtitle: ""
summary: "This blog post shows how to order rows in a dataframe using four different approaches: base R, data.table, dplyr, and pandas."
authors: []
tags: ["R", "python", "dplyr", "base R", "data.table", "pandas"]
categories: []
date: 2023-01-16
lastmod: 2023-01-16
featured: false
draft: true

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
rmd_hash: c57ab7be864f731f

---

-   <a href="#intro" id="toc-intro">Intro</a>
-   <a href="#challenges-setup" id="toc-challenges-setup">Challenges &amp; Setup</a>
-   <a href="#basic-ordering" id="toc-basic-ordering">Basic ordering</a>
    -   <a href="#base-r" id="toc-base-r">base R</a>
    -   <a href="#data.table" id="toc-data.table">data.table</a>
    -   <a href="#dplyr" id="toc-dplyr">dplyr</a>
    -   <a href="#pandas" id="toc-pandas">pandas</a>
-   <a href="#advanced-ordering-operations" id="toc-advanced-ordering-operations">Advanced ordering operations</a>
    -   <a href="#data.table-1" id="toc-data.table-1">data.table</a>
    -   <a href="#dplyr-1" id="toc-dplyr-1">dplyr</a>
    -   <a href="#pandas-1" id="toc-pandas-1">pandas</a>

## Intro

Sorting rows in a `data.frame` is generally considered a straightforward task, which it mostly is - until it isn't. This post looks at several ordering operations and compares how the three big paradigms in R, base R, 'data.table' and 'dplyr', compare in tackling problems with increasing complexity.

This blog post is split in two parts. If you're already familiar with the <a href="#basic-ordering" role="highlight">basics</a> just skip through to the <a href="#advanced-ordering-operations" role="highlight">advanced ordering operations</a> below. Each part concludes by comparing how we would tackle the same problems in Python's 'pandas' library.

Let's start by outlining the challenges and setup.

## Challenges & Setup

In the fist part we start with the very basics:

1.  Ordering rows according to one or several columns in ascending or descending order.
2.  Using an expressions to sort by.
3.  Order a `data.frame` according to all columns.
4.  Use a vector of column names to programmatically order rows.

In the second part we look at the following advanced ordering operations.

Order rows according to:

1.  ... a character vector with matching names.
2.  ... a vector of matching patterns.
3.  ... an [`ifelse()`](https://rdrr.io/r/base/ifelse.html) expression.

Below is our setup. We take R's build in `mtcars` data, extract a couple of rows and columns to make it more compact, and introduce some `NA`s to get an understanding of what's happening when the data includes missing values.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>mycols</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"cyl"</span>, <span class='s'>"vs"</span>, <span class='s'>"gear"</span>, <span class='s'>"mpg"</span>, <span class='s'>"disp"</span><span class='o'>)</span></span>
<span><span class='nv'>myrows</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/which.html'>which</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/base/colnames.html'>rownames</a></span><span class='o'>(</span><span class='nv'>mtcars</span><span class='o'>)</span> <span class='o'><a href='https://rdrr.io/r/base/match.html'>%in%</a></span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"Cadillac Fleetwood"</span>, <span class='s'>"Honda Civic"</span><span class='o'>)</span><span class='o'>)</span></span>
<span><span class='nv'>mycars</span> <span class='o'>&lt;-</span> <span class='nv'>mtcars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='m'>1</span><span class='o'>:</span><span class='m'>10</span>, <span class='nv'>myrows</span><span class='o'>)</span>, <span class='nv'>mycols</span><span class='o'>]</span></span>
<span></span>
<span><span class='nv'>mycars</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/data.frame.html'>data.frame</a></span><span class='o'>(</span>model <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/colnames.html'>rownames</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>)</span>,</span>
<span>                     <span class='nf'><a href='https://rdrr.io/r/base/data.frame.html'>data.frame</a></span><span class='o'>(</span><span class='nv'>mycars</span>, row.names<span class='o'>=</span><span class='kc'>NULL</span><span class='o'>)</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>model</span> <span class='o'><a href='https://rdrr.io/r/base/match.html'>%in%</a></span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"Cadillac Fleetwood"</span>, <span class='s'>"Honda Civic"</span><span class='o'>)</span>, <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"mpg"</span>, <span class='s'>"disp"</span><span class='o'>)</span><span class='o'>]</span> <span class='o'>&lt;-</span> <span class='kc'>NA</span></span>
<span></span>
<span><span class='nv'>mycars</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span></span></code></pre>

</div>

Finally lets save this data to a csv file which we will read in later in Python:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nf'><a href='https://rdrr.io/r/utils/write.table.html'>write.csv</a></span><span class='o'>(</span><span class='nv'>mycars</span>, <span class='s'>"mycars.csv"</span><span class='o'>)</span></span>
<span><span class='c'># available at:</span></span>
<span><span class='c'># read.csv("https://raw.githubusercontent.com/TimTeaFan/tt_website/main/content/post/2023-ordering-rows/mycars.csv")</span></span></code></pre>

</div>

## Basic ordering

In this section we will look at the basic ordering operations. We start with base R and then work through 'data.table' and 'dplyr'.

### base R

#### Ordering one or several variables

Ordering rows of a `data.frame` in base R is simple: we subset the rows of the `data.frame` with the [`order()`](https://rdrr.io/r/base/order.html) function called on one or more variables.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># order by one column ascending</span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>mpg</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span></span><span></span>
<span><span class='c'># order by two columns, first descending, second ascending:</span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='o'>-</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>mpg</span>, <span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>cyl</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span></span></code></pre>

</div>

Important to note is that, as default, `NA`s are sorted to bottom of the `data.frame` (read more about sorting `NA` values below).

<div class="info-box" title="Ordering rows containing NAs">

Base R's [`order()`](https://rdrr.io/r/base/order.html) has an argument `na.last` which is set to `TRUE` by default and sorts `NA` to the bottom:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>mpg</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span></span></code></pre>

</div>

Setting `na.last = FALSE` sorts `NA`s to the top:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>mpg</span>, na.last <span class='o'>=</span> <span class='kc'>FALSE</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span></span></code></pre>

</div>

A bit surprisingly `na.last` can also be set `NA` which will remove `NA`s from the vector or `data.frame` making it a combined filter and ordering operation:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>mpg</span>, na.last <span class='o'>=</span> <span class='kc'>NA</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span><span class='c'>#&gt;                model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 7         Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 6            Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 5  Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 10          Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 1          Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2      Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 4     Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 3         Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 9           Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 8          Merc 240D   4  1    4 24.4 146.7</span></span>
<span></span></code></pre>

</div>

For some users this behavior might not be very intuitive, which is why splitting ordering and filtering operations is preferable for code clarity.

This is especially relevant for users coming from 'dplyr' or 'data.table'. [`dplyr::arrange()`](https://dplyr.tidyverse.org/reference/arrange.html) always orders `NA`s last and doesn't come with an option to change this behavior. [`data.table::setorder()`](https://Rdatatable.gitlab.io/data.table/reference/setorder.html) has an argument `na.last`, but (1) it can only be set `TRUE` or `FALSE` and (2) it defaults to the former which is the opposite of what [`base::order()`](https://rdrr.io/r/base/order.html) does:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>mycarsDT</span> <span class='o'>&lt;-</span> <span class='nf'>data.table</span><span class='nf'>::</span><span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/as.data.table.html'>as.data.table</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>)</span></span>
<span><span class='nf'>data.table</span><span class='nf'>::</span><span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/setorder.html'>setorder</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span>, <span class='nv'>mpg</span><span class='o'>)</span></span>
<span><span class='nv'>mycarsDT</span></span>
<span><span class='c'>#&gt;                  model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt;  1: Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt;  2:        Honda Civic   4  1    4   NA    NA</span></span>
<span><span class='c'>#&gt;  3:         Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt;  4:            Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt;  5:  Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt;  6:           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt;  7:          Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  8:      Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  9:     Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 10:         Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 11:           Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 12:          Merc 240D   4  1    4 24.4 146.7</span></span>
<span></span></code></pre>

</div>

</div>

How different vector types are sorted and some more information about what exactly happens, when we call `df[order(variable), ]` can be found in the info box below.

<div class="info-box" title="The logic of ordering rows in base R">

How does the above syntax work? Lets look at a three-column `data.frame`

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>dat</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/data.frame.html'>data.frame</a></span><span class='o'>(</span>x <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='m'>100</span>, <span class='m'>1</span>, <span class='m'>10</span><span class='o'>)</span>, y <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"a"</span>, <span class='s'>"c"</span>, <span class='s'>"b"</span><span class='o'>)</span>, z <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='kc'>TRUE</span>, <span class='kc'>FALSE</span>, <span class='kc'>TRUE</span><span class='o'>)</span><span class='o'>)</span></span>
<span><span class='nv'>dat</span></span>
<span><span class='c'>#&gt;     x y     z</span></span>
<span><span class='c'>#&gt; 1 100 a  TRUE</span></span>
<span><span class='c'>#&gt; 2   1 c FALSE</span></span>
<span><span class='c'>#&gt; 3  10 b  TRUE</span></span>
<span></span></code></pre>

</div>

The output of `order(dat$x)` shows us the row numbers in which we would have to order our `data.frame` to make the values in `dat$x` run from smallest to highest.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>dat</span><span class='o'>$</span><span class='nv'>x</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; [1] 2 3 1</span></span>
<span></span></code></pre>

</div>

We can read this as: "The second row should come first, the third row should come second, and the first row should come last". To actually order the rows according to this logic, we subset the `data.frame` by its rows according to the logic `df[row_index, ]`:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>dat</span> <span class='o'>&lt;-</span> <span class='nv'>dat</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>dat</span><span class='o'>$</span><span class='nv'>x</span><span class='o'>)</span>, <span class='o'>]</span></span>
<span><span class='nv'>dat</span></span>
<span><span class='c'>#&gt;     x y     z</span></span>
<span><span class='c'>#&gt; 2   1 c FALSE</span></span>
<span><span class='c'>#&gt; 3  10 b  TRUE</span></span>
<span><span class='c'>#&gt; 1 100 a  TRUE</span></span>
<span></span></code></pre>

</div>

Now the rows are in the desired order, but note, that the row indices still correspond to the original indices. This makes it (relatively) easy to restore the old ordering:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>dat</span> <span class='o'>&lt;-</span> <span class='nv'>dat</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/base/numeric.html'>as.numeric</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/base/colnames.html'>rownames</a></span><span class='o'>(</span><span class='nv'>dat</span><span class='o'>)</span><span class='o'>)</span><span class='o'>)</span>, <span class='o'>]</span></span>
<span><span class='nv'>dat</span></span>
<span><span class='c'>#&gt;     x y     z</span></span>
<span><span class='c'>#&gt; 1 100 a  TRUE</span></span>
<span><span class='c'>#&gt; 2   1 c FALSE</span></span>
<span><span class='c'>#&gt; 3  10 b  TRUE</span></span>
<span></span></code></pre>

</div>

Note hat the logic of ordering is the same for the most common data types. [`order()`](https://rdrr.io/r/base/order.html) sorts the values from smallest to largest. For `integer` and `double` vectors (including `Date`s and date times, like `POSIXct`) this is pretty straightforward. Also for `character` vectors the logic is simple: `"a"` is "smaller" than `"b"`, so the ascending order goes from A to Z, with small coming before capital letters. We can always verify how character values relate:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='s'>"a"</span> <span class='o'>&gt;</span> <span class='s'>"A"</span></span>
<span><span class='c'>#&gt; [1] FALSE</span></span>
<span></span></code></pre>

</div>

For `logical` vectors `FALSE` can be read as `0` and `TRUE` as `1` which is the ascending order in which the values will be sorted. Although this makes perfectly sense, given that this is the way logical vectors are coerced to numeric, we will see later that this might be confusing when specifying explict values to sort by.

Finally, the only special case are `factor` variables. Here the sorting follows the factor [`levels()`](https://rdrr.io/r/base/levels.html):

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>dat</span><span class='o'>$</span><span class='nv'>y</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/factor.html'>factor</a></span><span class='o'>(</span><span class='nv'>dat</span><span class='o'>$</span><span class='nv'>y</span>, levels <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"b"</span>, <span class='s'>"a"</span>, <span class='s'>"c"</span><span class='o'>)</span><span class='o'>)</span></span>
<span><span class='nv'>dat</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>dat</span><span class='o'>$</span><span class='nv'>y</span><span class='o'>)</span>, <span class='o'>]</span></span>
<span><span class='c'>#&gt;     x y     z</span></span>
<span><span class='c'>#&gt; 3  10 b  TRUE</span></span>
<span><span class='c'>#&gt; 1 100 a  TRUE</span></span>
<span><span class='c'>#&gt; 2   1 c FALSE</span></span>
<span></span></code></pre>

</div>

</div>

#### Using expressions to sort by

Apart from sorting according to one or more variables, sometimes we want to sort according to a specific expression. Lets say we want the row `"Hornet Sportabout"` to be sorted to the top of our `data.frame`. In this case, we can construct a logical vector `mycars$model != "Hornet Sportabout"` returning `TRUE` and `FALSE`. Passing this to [`order()`](https://rdrr.io/r/base/order.html) yields the desired result:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># bring one column to the top / bottom</span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>model</span> <span class='o'>!=</span> <span class='s'>"Hornet Sportabout"</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span></span></code></pre>

</div>

Note, that we negate the comparison with `!=`, since `logical` vectors are sorted from `FALSE` to `TRUE` (see info box: "the logic of ordering rows" above).

#### Sorting by all variables

Another common operation is to order by all variables in a `data.frame`. For our toy data this means we want to first sort `cyl` from `4` to `8`, within `cyl` we want the rows to be sorted according to `vs` and ties here should be sorted according to `gear`, `mpg` and then `dsip`.

We could just write out all variables as we did in the examples above:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>cyl</span>, <span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>vs</span>, <span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>gear</span>, <span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>mpg</span>, <span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>disp</span><span class='o'>)</span>,<span class='o'>]</span></span></code></pre>

</div>

However, this is a lot of typing. Ideally we'd prefer a more programmatic way of sorting according to all variables. In base R, we can do this with `do.call("order", args = list_of_vectors_to_sort_by)`.

`do.call` basically constructs and evaluates a call to the specified function, here `"order"`, and passes the `list` in the `args` argument to the arguments of the call to [`order()`](https://rdrr.io/r/base/order.html).

In our case the list of vectors to sort by is the `mycars` `data.frame` itself except for the first column `model`, hence `mycars[,-1]`. Since we want to pass our list of vectors to `order`'s ellipsis `...` argument, the vectors in our `list` should be unnamed: `unname(mycars[,-1])`.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># order by all columns ascending</span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/do.call.html'>do.call</a></span><span class='o'>(</span><span class='s'>"order"</span>, <span class='nf'><a href='https://rdrr.io/r/base/unname.html'>unname</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>[</span>,<span class='o'>-</span><span class='m'>1</span><span class='o'>]</span><span class='o'>)</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span></span></code></pre>

</div>

Forgetting to [`unname()`](https://rdrr.io/r/base/unname.html) our list of vectors will cause trouble if one of the column names corresponds to an argument of [`order()`](https://rdrr.io/r/base/order.html): `na.last`, `decreasing` and `method`. In this case `do.call` will pass the values of this column to the corresponding argument, throwing an error in the best case, or doing something we don't expect (and notice) in the worst.

#### Sorting by a list of variables

Similar to sorting a `data.frame` by all variables, we sometimes have a vector of variables names we want to sort by. Here we can apply the same approach as above and use `do.call("order", ...)` on our `data.frame`. Lets further assume that we want to sort some columns ascending and some descending.

In this case we combine both arguments, the vectors to sort by and their decreasing order, in a list and supply it to `do.call("order", our_list_of_argument)`:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># lets say we have the names of the columns ...</span></span>
<span><span class='c'># ... we want to order by in a vector</span></span>
<span><span class='nv'>mycols</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"mpg"</span>, <span class='s'>"cyl"</span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># then we need to construct the arguments in list form ...</span></span>
<span><span class='c'># 1. only the values of the columns to sort by (therefore `unname()`)</span></span>
<span><span class='nv'>sort_df</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/unname.html'>unname</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>[</span>,<span class='nv'>mycols</span><span class='o'>]</span><span class='o'>)</span></span>
<span><span class='c'># 2. the logical values for `order()`s `decreasing` argument:</span></span>
<span><span class='nv'>desc_ls</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span>decreasing <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='kc'>TRUE</span>, <span class='kc'>FALSE</span><span class='o'>)</span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># we combine the arguments inside `do.call()`</span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/do.call.html'>do.call</a></span><span class='o'>(</span><span class='s'>"order"</span>, <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='nv'>sort_df</span>, <span class='nv'>desc_ls</span><span class='o'>)</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span></span>
<span><span class='c'># the above is equivalent to </span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='o'>-</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>mpg</span>, <span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>cyl</span><span class='o'>)</span>,<span class='o'>]</span></span></code></pre>

</div>

#### Summing up: Ordering in base R

Ordering in base R boils down to subsetting a `data.frame` by itself in a different order. We create this new order either by applying [`order()`](https://rdrr.io/r/base/order.html) directly to one or several variables, or by wrapping it in a [`do.call()`](https://rdrr.io/r/base/do.call.html) together with a list of arguments.

While the former can be considered an easy, straightforward operation, the later requires quite some knowledge about constructing calls with [`do.call()`](https://rdrr.io/r/base/do.call.html) and the possible pitfalls we might encounter (think of: [`unname()`](https://rdrr.io/r/base/unname.html)). Nevertheless, once useRs have understood the advanced concept of [`do.call()`](https://rdrr.io/r/base/do.call.html) and how to use it, the more advanced ordering operations can be tackled easily well.

### data.table

When it comes to orderings rows 'data.table' is not much different than base R. Most of the ordering operations introduced above can be applied almost identically on a `data.table`.

One decisive difference between base R is that 'data.table' supports non-standard evaluation (NSE) within the subsetting / extracting `[` expression.

This means we can refer bare column names like:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://r-datatable.com'>data.table</a></span><span class='o'>)</span></span>
<span><span class='nv'>mycarsDT</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/as.data.table.html'>as.data.table</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># both work in data.table</span></span>
<span><span class='nv'>mycarsDT</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span><span class='o'>$</span><span class='nv'>mpg</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span><span class='nv'>mycarsDT</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mpg</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span></span>
<span><span class='c'># only the first works in base R </span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>mpg</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mpg</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span><span class='c'>#&gt; Error in order(mpg): object 'mpg' not found</span></span>
<span></span></code></pre>

</div>

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://r-datatable.com'>data.table</a></span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>mycarsDT</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/as.data.table.html'>as.data.table</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># data.table supports non standard evaluation (NSE) ...</span></span>
<span><span class='c'># ... which is why we can call `mpg` instead of `mycarsDT$mpg`.</span></span>
<span><span class='nv'>mycarsDT</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span><span class='o'>$</span><span class='nv'>mpg</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span><span class='c'>#&gt;                  model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt;  1:         Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt;  2:            Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt;  3:  Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt;  4:           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt;  5:          Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  6:      Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  7:     Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt;  8:         Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt;  9:           Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 10:          Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 11: Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 12:        Honda Civic   4  1    4   NA    NA</span></span>
<span></span><span><span class='nv'>mycarsDT</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mpg</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span><span class='c'>#&gt;                  model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt;  1:         Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt;  2:            Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt;  3:  Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt;  4:           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt;  5:          Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  6:      Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  7:     Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt;  8:         Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt;  9:           Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 10:          Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 11: Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 12:        Honda Civic   4  1    4   NA    NA</span></span>
<span></span><span></span>
<span><span class='c'># order by one column ascending</span></span>
<span><span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/setorder.html'>setorder</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span>, <span class='nv'>mpg</span><span class='o'>)</span></span>
<span><span class='nv'>mycarsDT</span></span>
<span><span class='c'>#&gt;                  model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt;  1: Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt;  2:        Honda Civic   4  1    4   NA    NA</span></span>
<span><span class='c'>#&gt;  3:         Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt;  4:            Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt;  5:  Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt;  6:           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt;  7:          Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  8:      Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  9:     Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 10:         Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 11:           Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 12:          Merc 240D   4  1    4 24.4 146.7</span></span>
<span></span><span></span>
<span><span class='c'># order by several columns</span></span>
<span><span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/setorder.html'>setorder</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span>, <span class='nv'>mpg</span>, na.last <span class='o'>=</span> <span class='kc'>TRUE</span><span class='o'>)</span></span>
<span><span class='nv'>mycarsDT</span></span>
<span><span class='c'>#&gt;                  model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt;  1:         Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt;  2:            Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt;  3:  Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt;  4:           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt;  5:          Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  6:      Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  7:     Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt;  8:         Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt;  9:           Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 10:          Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 11: Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 12:        Honda Civic   4  1    4   NA    NA</span></span>
<span></span><span></span>
<span><span class='c'># order by all rows</span></span>
<span><span class='nv'>mycarsDT</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/do.call.html'>do.call</a></span><span class='o'>(</span><span class='s'>"order"</span>, <span class='nf'><a href='https://rdrr.io/r/base/unname.html'>unname</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span><span class='o'>[</span>,<span class='o'>-</span><span class='m'>1</span><span class='o'>]</span><span class='o'>)</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span><span class='c'>#&gt;                  model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt;  1:         Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt;  2:           Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt;  3:          Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt;  4:        Honda Civic   4  1    4   NA    NA</span></span>
<span><span class='c'>#&gt;  5:          Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  6:      Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  7:            Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt;  8:     Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt;  9:           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 10:         Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 11:  Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 12: Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span></span><span></span>
<span><span class='c'># list of columns</span></span>
<span><span class='nv'>sort_df</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/unname.html'>unname</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span><span class='o'>[</span>,<span class='nv'>mycols</span>, with <span class='o'>=</span> <span class='kc'>FALSE</span><span class='o'>]</span><span class='o'>)</span></span>
<span><span class='nv'>desc_ls</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span>decreasing <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='kc'>TRUE</span>, <span class='kc'>FALSE</span><span class='o'>)</span><span class='o'>)</span></span>
<span><span class='nv'>mycarsDT</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/do.call.html'>do.call</a></span><span class='o'>(</span><span class='s'>"order"</span>, <span class='nf'><a href='https://rdrr.io/r/base/unname.html'>unname</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span><span class='o'>[</span>,<span class='o'>-</span><span class='m'>1</span><span class='o'>]</span><span class='o'>)</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span><span class='c'>#&gt;                  model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt;  1:         Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt;  2:           Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt;  3:          Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt;  4:        Honda Civic   4  1    4   NA    NA</span></span>
<span><span class='c'>#&gt;  5:          Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  6:      Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  7:            Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt;  8:     Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt;  9:           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 10:         Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 11:  Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 12: Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span></span><span></span>
<span><span class='c'># setorder(mycarsDT, mpg, na.last = NA)</span></span>
<span><span class='nv'>mycarsDT</span></span>
<span><span class='c'>#&gt;                  model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt;  1:         Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt;  2:            Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt;  3:  Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt;  4:           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt;  5:          Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  6:      Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  7:     Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt;  8:         Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt;  9:           Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 10:          Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 11: Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 12:        Honda Civic   4  1    4   NA    NA</span></span>
<span></span><span></span>
<span><span class='c'># order by two columns, first descending, second ascending,</span></span>
<span><span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/setorder.html'>setorder</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span>, <span class='o'>-</span><span class='nv'>mpg</span>, <span class='nv'>cyl</span>, na.last <span class='o'>=</span> <span class='kc'>TRUE</span><span class='o'>)</span></span>
<span><span class='nv'>mycarsDT</span></span>
<span><span class='c'>#&gt;                  model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt;  1:          Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt;  2:         Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt;  3:           Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt;  4:     Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt;  5:          Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  6:      Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  7:           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt;  8:  Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt;  9:            Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 10:         Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 11:        Honda Civic   4  1    4   NA    NA</span></span>
<span><span class='c'>#&gt; 12: Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span></span></code></pre>

</div>

Order according to a vector of column names:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># lets say we have the names of the columns ...</span></span>
<span><span class='c'># ... we want to order by in a vector</span></span>
<span><span class='nv'>mycols</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"mpg"</span>, <span class='s'>"cyl"</span><span class='o'>)</span></span>
<span></span>
<span><span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/setorder.html'>setorderv</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span>,</span>
<span>          cols <span class='o'>=</span> <span class='nv'>mycols</span>,</span>
<span>          order <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='o'>-</span><span class='m'>1</span>,<span class='m'>1</span><span class='o'>)</span>,</span>
<span>          na.last <span class='o'>=</span> <span class='kc'>TRUE</span><span class='o'>)</span></span>
<span></span>
<span></span>
<span><span class='c'># the above is equivalent to </span></span>
<span><span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/setorder.html'>setorder</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span>, <span class='o'>-</span><span class='nv'>mpg</span>, <span class='nv'>cyl</span>, na.last <span class='o'>=</span> <span class='kc'>TRUE</span><span class='o'>)</span></span></code></pre>

</div>

### dplyr

### pandas

## Advanced ordering operations

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># order by matching vector</span></span>
<span><span class='nv'>my_vec</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"Hornet Sportabout"</span>, <span class='s'>"Cadillac Fleetwood"</span>, <span class='s'>"Valiant"</span>,</span>
<span>            <span class='s'>"Hornet 4 Drive"</span>, <span class='s'>"Mazda RX4"</span>, <span class='s'>"Mazda RX4 Wag"</span>, <span class='s'>"Honda Civic"</span>,</span>
<span>            <span class='s'>"Datsun 710"</span>, <span class='s'>"Duster 360"</span>, <span class='s'>"Merc 240D"</span>, <span class='s'>"Merc 230"</span>, <span class='s'>"Merc 280"</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/base/factor.html'>factor</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>model</span>, levels <span class='o'>=</span> <span class='nv'>my_vec</span><span class='o'>)</span><span class='o'>)</span>, <span class='o'>]</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span></span><span></span>
<span></span>
<span></span>
<span><span class='c'># order by matching pattern</span></span>
<span><span class='nv'>my_pattern</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"Mazda"</span>, <span class='s'>"Merc"</span>, <span class='s'>"Hornet"</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>idx_ls</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/lapply.html'>lapply</a></span><span class='o'>(</span><span class='nv'>my_pattern</span>,</span>
<span>                 \<span class='o'>(</span><span class='nv'>x</span><span class='o'>)</span> <span class='o'>-</span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/base/grep.html'>grepl</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/base/paste.html'>paste0</a></span><span class='o'>(</span><span class='s'>"^"</span>, <span class='nv'>x</span><span class='o'>)</span>, <span class='nf'><a href='https://rdrr.io/r/base/colnames.html'>rownames</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>)</span><span class='o'>)</span><span class='o'>)</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/do.call.html'>do.call</a></span><span class='o'>(</span><span class='nv'>order</span>, <span class='nv'>idx_ls</span><span class='o'>)</span>, <span class='o'>]</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span></span><span></span>
<span><span class='c'># order by ifelse</span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>vs</span>, <span class='nf'><a href='https://rdrr.io/r/base/ifelse.html'>ifelse</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>vs</span> <span class='o'>==</span> <span class='m'>1</span>, <span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>mpg</span>, <span class='o'>-</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>mpg</span><span class='o'>)</span><span class='o'>)</span>, <span class='o'>]</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span></span></code></pre>

</div>

### data.table

### dplyr

### pandas

<div class="session" markdown="1">

<details class="sess">
<summary class="session-header">
Session Info <i class="fas fa-tools"></i>
</summary>

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'>#&gt; <span style='color: #00BBBB; font-weight: bold;'>─ Session info ───────────────────────────────────────────────────────────────</span></span></span>
<span><span class='c'>#&gt;  <span style='color: #555555; font-style: italic;'>setting </span> <span style='color: #555555; font-style: italic;'>value</span></span></span>
<span><span class='c'>#&gt;  version  R version 4.2.1 (2022-06-23)</span></span>
<span><span class='c'>#&gt;  os       macOS Big Sur ... 10.16</span></span>
<span><span class='c'>#&gt;  system   x86_64, darwin17.0</span></span>
<span><span class='c'>#&gt;  ui       X11</span></span>
<span><span class='c'>#&gt;  language (EN)</span></span>
<span><span class='c'>#&gt;  collate  en_US.UTF-8</span></span>
<span><span class='c'>#&gt;  ctype    en_US.UTF-8</span></span>
<span><span class='c'>#&gt;  tz       Europe/Berlin</span></span>
<span><span class='c'>#&gt;  date     2023-01-29</span></span>
<span><span class='c'>#&gt;  pandoc   2.19.2 @ /Applications/RStudio.app/Contents/MacOS/quarto/bin/tools/ (via rmarkdown)</span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #00BBBB; font-weight: bold;'>─ Packages ───────────────────────────────────────────────────────────────────</span></span></span>
<span><span class='c'>#&gt;  <span style='color: #555555; font-style: italic;'>package   </span> <span style='color: #555555; font-style: italic;'>*</span> <span style='color: #555555; font-style: italic;'>version</span> <span style='color: #555555; font-style: italic;'>date (UTC)</span> <span style='color: #555555; font-style: italic;'>lib</span> <span style='color: #555555; font-style: italic;'>source</span></span></span>
<span><span class='c'>#&gt;  data.table * 1.14.2  <span style='color: #555555;'>2021-09-27</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  reticulate * 1.26    <span style='color: #555555;'>2022-08-31</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> [1] /Library/Frameworks/R.framework/Versions/4.2/Resources/library</span></span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #00BBBB; font-weight: bold;'>─ Python configuration ───────────────────────────────────────────────────────</span></span></span>
<span><span class='c'>#&gt;  python:         /usr/local/Caskroom/miniconda/base/bin/python3.9</span></span>
<span><span class='c'>#&gt;  libpython:      /usr/local/Caskroom/miniconda/base/lib/libpython3.9.dylib</span></span>
<span><span class='c'>#&gt;  pythonhome:     /usr/local/Caskroom/miniconda/base:/usr/local/Caskroom/miniconda/base</span></span>
<span><span class='c'>#&gt;  version:        3.9.12 (main, Apr  5 2022, 01:53:17)  [Clang 12.0.0 ]</span></span>
<span><span class='c'>#&gt;  numpy:          /usr/local/Caskroom/miniconda/base/lib/python3.9/site-packages/numpy</span></span>
<span><span class='c'>#&gt;  numpy_version:  1.22.3</span></span>
<span><span class='c'>#&gt;  pandas:         /usr/local/Caskroom/miniconda/base/lib/python3.9/site-packages/pandas</span></span>
<span><span class='c'>#&gt;  </span></span>
<span><span class='c'>#&gt;  NOTE: Python version was forced by RETICULATE_PYTHON</span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #00BBBB; font-weight: bold;'>──────────────────────────────────────────────────────────────────────────────</span></span></span>
<span></span></code></pre>

</div>

</details>

</div>

<script>
  function create_info_box(title, content) {
    let summary = document.createElement("summary");
    summary.classList.add("note-header");
    summary.setAttribute("markdown", "1");

    let summary_title = document.createTextNode(title)
    let summary_icon = document.createElement('i');
    summary_icon.classList.add("fas", "fa-info-circle");
    summary.append(summary_title, summary_icon);

    let div_note_details = document.createElement("div");
    div_note_details.classList.add('note-details');
    div_note_details.append(...content)

    let details = document.createElement('details');
    details.append(summary, div_note_details);

    let div_note = document.createElement("div");
    div_note.classList.add('note');
    div_note.setAttribute("markdown", "1");
    div_note.append(details);
    return(div_note)
  };

  function info_box() {
    let childs = document.querySelectorAll("div.info-box");
    childs.forEach(el => {
      let title = el.title
      let info_box = create_info_box(title, el.childNodes);
      el.append(info_box)
    });
  };

  window.onload = info_box();
</script>

