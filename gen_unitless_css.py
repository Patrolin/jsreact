import json
import re
from typing import Any, cast
import urllib.request

# TODO: rewrite this in a nonstupid language with proper parsing...

# utils
def fetch_json_dict(url: str) -> dict[str, Any]:
  with urllib.request.urlopen(url) as response:
    return cast(dict[str, Any], json.load(response))
def react_css_prop_name(string: str) -> str:
  capitalize_first_letter = string[0] == "-"
  if capitalize_first_letter: string = string[1:]
  acc = ""
  for i, subpath in enumerate(string.split("-")):
    if i > 0 or capitalize_first_letter:
      acc += subpath[0].upper() + subpath[1:]
    else:
      acc += subpath
  return acc

# params
MDN_CSS_SYNTAXES = "https://raw.githubusercontent.com/mdn/data/main/css/syntaxes.json"
MDN_CSS_PROPERTIES = "https://raw.githubusercontent.com/mdn/data/main/css/properties.json"
NUMERIC_BUILTIN_TYPES = ("number", "integer")
CSS_PROP_BLACKLIST = ("counter-increment", "counter-reset", "counter-set",
                      "font", "font-feature-settings",
                      "mask-border", "mask-border-outset", "mask-border-slice", "mask-border-width",
                      "rotate", "text-combine-upright")

# 30% pure ai slop, 70% fixing bugs
properties = fetch_json_dict(MDN_CSS_PROPERTIES)
syntaxes = fetch_json_dict(MDN_CSS_SYNTAXES)
for name in list(syntaxes.keys()):
  if name.endswith("()") or name in NUMERIC_BUILTIN_TYPES: syntaxes.pop(name)

DEBUG = False
def syntax_allows_number(syntax: str, seen: set[str]):
  matches = re.findall(r"<([^>]+)>", syntax)
  for name in matches:
    if name in NUMERIC_BUILTIN_TYPES: return True # numeric types
    if name.startswith("'"):
      property = properties[name[1:-1]]
      if DEBUG: print(f"  {name}: {property["syntax"]}")
      if syntax_allows_number(property["syntax"], seen): return True
    else:
      if name in seen: return False # infinite loop
      next_syntax = syntaxes.get(name)
      if next_syntax:
        if DEBUG: print(f"  {name}: {next_syntax["syntax"]}")
        seen.add(name)
        if syntax_allows_number(next_syntax["syntax"], seen): return True
      else: pass # builtin type
  return False

unitless_css_props = []
for css_prop_name, info in properties.items():
  syntax = info["syntax"]
  if DEBUG: print(f"{css_prop_name}: {syntax}")
  if css_prop_name not in CSS_PROP_BLACKLIST and syntax_allows_number(syntax, set()):
    unitless_css_props.append(css_prop_name)
unitless_react_css_props = []
for css_prop_name in unitless_css_props:
  name = react_css_prop_name(css_prop_name)
  unitless_react_css_props.append(name)
  if name[0] == name[0].upper(): unitless_react_css_props.append(name[0].lower() + name[1:])
for name in sorted(unitless_react_css_props, key = lambda x: [x.lower(), x]):
  print(name)
