# Jonathan Petersen, John Humble
# CS 5890 - Data Visualization
# Obscura Conversion Script

for filename in ../../clouds-raw/*.grb2; do
  echo ${filename}
  ./grib2json --names --data --fc 6 --fp 1 -o "../../clouds/clouds_${filename:32:8}.json" -c "${filename}"
done
