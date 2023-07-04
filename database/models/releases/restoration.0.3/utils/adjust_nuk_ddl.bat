cp ..\restoration.sql restoration_unadjusted.sql
del ..\restoration.sql
sed -e 's/record_end_date)/(record_end_date is NULL)) where record_end_date is null/g' restoration_unadjusted.sql >> restoration.sql
cp restoration.sql ..
del restoration_unadjusted.sql
del restoration.sql