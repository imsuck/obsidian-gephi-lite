# Gephi Lite in Obsidian

This plugin embeds a [Gephi Lite](https://gephi.org/lite/) instance in your Obsidian,
and with it you can play around with some network analysis!

## Installation

Currently, one can (only) install the plugin using [BRAT](https://community.obsidian.md/plugins/obsidian42-brat).
Waiting for the plugin to be approved on Obsidian's community plugin list.

## Usage

This plugin has two commands:

- Open graph view: self-explanatory
- Refresh graph: for when your graph updates, or nothing is displayed.

How to use Gephi Lite:

Typically, you would pick the ForceAtlas2 layout (and click on the magic wand
next to the start button), and then start the simulation. After that, you might want
to run a few graph analytic algorithms over at **Metrics**. To use the results from the analyses,
go to the **Appearance** section and configure colors, sizes, labels to your liking.
And finally, you can export your graph as an image by going to the **Workspace** menu
at the top left of the page.

Unfortunately, the current sdk does not allow updating the layout automatically so
you'd have to go through this process any time you use Gephi Lite.

## Mobile support

Mobile support is not like to to come soon as we have to host a gephi-lite instance
and serve it via HTTP, which requires a node runtime, something not present on mobile.

## Gephi Lite static files

These files are built from source in [my own fork](https://github.com/imsuck/gephi-lite/) of Gephi Lite,
using github actions, and then downloaded into `assets/`. See [`assets`](./assets/README.md)
for more information.
