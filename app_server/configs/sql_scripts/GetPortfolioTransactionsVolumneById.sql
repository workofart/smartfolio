-- FUNCTION: public.GetPortfolioTransactionsVolumneById(integer)
-- In command line, to install function run: "psql -d <dbname> -a -f <filename>"
DROP FUNCTION IF EXISTS public.GetPortfolioTransactionsVolumneById(integer);

CREATE OR REPLACE FUNCTION public.GetPortfolioTransactionsVolumneById
(
    s_portfolioid INTEGER
)
RETURNS TABLE (
    ticker VARCHAR(8),
    date DATE,
    value NUMERIC
)
AS
$$
BEGIN
	DROP TABLE IF EXISTS OutputTable;
	CREATE TEMP TABLE OutputTable (
        date DATE,
        ticker VARCHAR(8),
        value NUMERIC
    );
    
    DROP TABLE IF EXISTS AllDates;
	CREATE TEMP TABLE AllDates (
        date DATE
    );
    
    INSERT INTO AllDates (date)
    SELECT DISTINCT date(T.datetime) FROM transactions AS T
    WHERE T.portfolioid = s_portfolioid;
    
    DROP TABLE IF EXISTS AllStocks;
	CREATE TEMP TABLE AllStocks (
        ticker VARCHAR(8)
    );
    
    INSERT INTO AllStocks (ticker)
    SELECT DISTINCT T.ticker FROM transactions AS T
    WHERE T.portfolioid = s_portfolioid;
    
    INSERT INTO OutputTable(date, ticker, value)
    SELECT
    	AD.date,
        A.ticker,
        0
     FROM AllDates AS AD
    CROSS JOIN AllStocks AS A;
    
    INSERT INTO OutputTable(date, ticker, value)
    SELECT 
    	O.date,
        O.ticker,
        SUM(T.quantity)
      FROM OutputTable AS O
    LEFT OUTER JOIN transactions as T ON O.date = date(T.datetime) AND O.ticker = T.ticker
    WHERE T.portfolioid = s_portfolioid
      AND T.status = 1
      AND T.ticker <> 'RESERVE'
    GROUP BY O.date, O.ticker;
    
    RETURN QUERY
    SELECT
    	O.ticker,
    	O.date,
        SUM(O.value)
    FROM OutputTable AS O
    WHERE O.ticker <> 'RESERVE'
    GROUP BY O.date, O.ticker
    ORDER BY O.ticker, O.date;
END;
$$

LANGUAGE 'plpgsql'