#!/bin/bash

#
# generate item records and check them all out.
# this is pretty clunky; lots of hard-coded data is required below.
#
# REQUIREMENTS
# stripes-cli, with `okapi login` already run and a token cached
# jq, download from https://stedolan.github.io/jq/
#
# ASSUMPTIONS
# this will checkout an item to the first active patron it finds
# loan-type "Can circulate" must exist
# service-point "online" must exist
# material-type "text" must exist
# there is at least one holdings record in

OKAPI="https://folio-snapshot-okapi.dev.folio.org"
ITEM_COUNT=100

#
# nothing to configure below
#

permanentLoanType=`stripes okapi get loan-types?query=name=="Can circulate" --okapi $OKAPI | jq -j '.loantypes[0].id'`;
materialType=`stripes okapi get material-types?query=name=="text" --okapi $OKAPI | jq -j '.mtypes[0].id'`;
servicePointId=`stripes okapi get service-points?query=name=="online" --okapi $OKAPI | jq -j '.servicepoints[0].id'`;
userBarcode=`stripes okapi get "users?query=active==true and type==patron&limit=1" --okapi $OKAPI | jq -j '.users[0].barcode'`;
holdingsRecordId=`stripes okapi get "holdings-storage/holdings?limit=1" --okapi $OKAPI  | jq -j '.holdingsRecords[0].id'`;

echo "found user barcode ${userBarcode}"

COUNTER=0
while [ $COUNTER -lt $ITEM_COUNT ]; do
  BARCODE=`date +"%s"`
  BARCODE="${BARCODE}${RANDOM}"

  ITEM_JSON=$(cat <<EOT
  {
      "status":{"name":"Available"},
      "holdingsRecordId":"${holdingsRecordId}",
      "barcode":"${BARCODE}",
      "materialType":{"id":"${materialType}"},
      "permanentLoanType":{"id":"${permanentLoanType}"}
  }
EOT
  );

  CHECKOUT_JSON=$(cat <<EOT
  {
      "itemBarcode":"${BARCODE}",
      "userBarcode":"${userBarcode}",
      "servicePointId":"${servicePointId}"
  }
EOT
  );


  echo $JSON;

  echo -n "creating item ${barcode}..."
  echo $ITEM_JSON | yarn stripes okapi post inventory/items --okapi $OKAPI
  echo $CHECKOUT_JSON | yarn stripes okapi post circulation/check-out-by-barcode --okapi $OKAPI
  echo " done"

  let COUNTER=COUNTER+1
done

echo "checked out ${COUNTER} items to ${userBarcode}"
