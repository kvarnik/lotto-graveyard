#!/bin/bash

# Download 78 Rider-Waite tarot images from public domain source
# Source: https://github.com/mixvlad/TarotCards (Public Domain)

BASE_URL="https://raw.githubusercontent.com/mixvlad/TarotCards/main/tarot/rider-waite/720px"
OUTPUT_DIR="../assets/tarot"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo "Downloading 78 Rider-Waite tarot card images..."

# Major Arcana (00-21) - 22 cards
echo "Downloading Major Arcana..."
for i in $(seq -f "%02g" 0 21); do
  echo "Downloading Major Arcana card ${i}..."
  curl -s -L -o "${OUTPUT_DIR}/major-${i}.jpg" "${BASE_URL}/${i}.jpg"
done

# Minor Arcana - 56 cards
# Wands (22-35) - 14 cards
echo "Downloading Wands suit..."
for i in $(seq 22 35); do
  local_id=$((i - 21))
  echo "Downloading Wands ${local_id}..."
  curl -s -L -o "${OUTPUT_DIR}/wands-$(printf "%02d" ${local_id}).jpg" "${BASE_URL}/${i}.jpg"
done

# Cups (36-49) - 14 cards
echo "Downloading Cups suit..."
for i in $(seq 36 49); do
  local_id=$((i - 35))
  echo "Downloading Cups ${local_id}..."
  curl -s -L -o "${OUTPUT_DIR}/cups-$(printf "%02d" ${local_id}).jpg" "${BASE_URL}/${i}.jpg"
done

# Swords (50-63) - 14 cards
echo "Downloading Swords suit..."
for i in $(seq 50 63); do
  local_id=$((i - 49))
  echo "Downloading Swords ${local_id}..."
  curl -s -L -o "${OUTPUT_DIR}/swords-$(printf "%02d" ${local_id}).jpg" "${BASE_URL}/${i}.jpg"
done

# Pentacles (64-77) - 14 cards
echo "Downloading Pentacles suit..."
for i in $(seq 64 77); do
  local_id=$((i - 63))
  echo "Downloading Pentacles ${local_id}..."
  curl -s -L -o "${OUTPUT_DIR}/pentacles-$(printf "%02d" ${local_id}).jpg" "${BASE_URL}/${i}.jpg"
done

echo "Download complete! 78 cards downloaded to ${OUTPUT_DIR}"
